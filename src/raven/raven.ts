import {Event, Filter, getEventHash, Kind, nip04, signEvent, SimplePool, Sub} from 'nostr-tools';
import {TypedEventEmitter} from 'raven/helper/event-emitter';
import {Channel, ChannelUpdate, DirectMessage, EventDeletion, Keys, Metadata, Profile, PublicMessage} from 'types';
import chunk from 'lodash.chunk';
import uniq from 'lodash.uniq';
import {getRelays} from 'helper';
import {notEmpty} from 'util/misc';

const relays = getRelays();

type EventWithRelays = Event;

export enum RavenEvents {
    Ready = 'ready',
    ProfileUpdate = 'profile_update',
    ChannelCreation = 'channel_creation',
    ChannelUpdate = 'channel_update',
    EventDeletion = 'event_deletion',
    PublicMessage = 'public_message',
    DirectMessage = 'direct_message',
}

type EventHandlerMap = {
    [RavenEvents.Ready]: () => void;
    [RavenEvents.ProfileUpdate]: (data: Profile[]) => void;
    [RavenEvents.ChannelCreation]: (data: Channel[]) => void;
    [RavenEvents.ChannelUpdate]: (data: ChannelUpdate[]) => void;
    [RavenEvents.EventDeletion]: (data: EventDeletion[]) => void;
    [RavenEvents.PublicMessage]: (data: PublicMessage[]) => void;
    [RavenEvents.DirectMessage]: (data: DirectMessage[]) => void;
};


class Raven extends TypedEventEmitter<RavenEvents, EventHandlerMap> {
    private pool: SimplePool;

    private readonly priv: string | 'nip07';
    private readonly pub: string;

    private readonly readRelays = Object.keys(relays).filter(r => relays[r].read);
    private readonly writeRelays = Object.keys(relays).filter(r => relays[r].write);

    // A flag to know if we have initial data loading done. Not guaranteed. For UI purposes.
    private ready = false;
    private readyTimer: any = null;

    private eventQueue: EventWithRelays [] = [];
    private eventQueueTimer: any;
    private eventQueueFlag = true;
    private eventQueueBuffer: EventWithRelays [] = [];

    private nameCache: Record<string, number> = {};

    listenerSub: Sub | null = null;

    constructor(priv: string, pub: string) {
        super();

        this.priv = priv;
        this.pub = pub;

        this.pool = new SimplePool();

        this.loadMe();

        this.readyTimer = setTimeout(() => {
            this.ready = true;
            this.emit(RavenEvents.Ready);
        }, 1000);
    }

    private fetch(filters: Filter[], unsub: boolean = true) {
        const sub = this.pool.sub(this.readRelays, filters);

        sub.on('event', (event) => {
            this.pushToEventBuffer(event);
        });

        sub.on('eose', () => {
            if (unsub) {
                sub.unsub();
            }
        });

        return sub;
    }

    public loadMe() {
        this.fetch([
            {
                authors: [this.pub],
            },
            {
                kinds: [Kind.EncryptedDirectMessage], // Direct messages to us
                '#p': [this.pub]
            }]);
    }

    public loadChannel(channel: string) {
        const cacheKey = `${channel}_loaded_channel`;
        if (this.nameCache[cacheKey] === undefined) {
            this.fetch([{
                kinds: [
                    Kind.EventDeletion,
                    Kind.ChannelMetadata,
                    Kind.ChannelMessage
                ],
                '#e': [channel],
            }]);
            this.nameCache[cacheKey] = 1;
        }
    }

    public loadId(id: string) {
        const cacheKey = `${id}_loaded_id`;
        if (this.nameCache[cacheKey] === undefined) {
            this.fetch([{ids: [id]}]);
            this.nameCache[cacheKey] = 1;
        }
    }

    public loadProfiles(pubs: string[]) {
        const authors = uniq(pubs).filter(p => this.nameCache[p] === undefined);
        if (authors.length === 0) {
            return;
        }
        authors.forEach(a => this.nameCache[a] = Date.now());

        chunk(authors, 20).forEach(a => {
            this.fetch([{
                kinds: [Kind.Metadata],
                authors: a,
            }])
        });
    }

    public listen(channels: string[], since: number) {
        if (this.listenerSub) {
            this.listenerSub.unsub();
        }

        this.listenerSub = this.fetch([{
            authors: [this.pub],
            since
        }, {
            kinds: [
                Kind.EventDeletion,
                Kind.ChannelMetadata,
                Kind.ChannelMessage
            ],
            '#e': channels,
            since
        }, {
            kinds: [Kind.EncryptedDirectMessage], // Direct messages to us
            '#p': [this.pub],
            since
        }], false);
    }

    public async updateProfile(profile: Metadata) {
        return this.publish(Kind.Metadata, [], JSON.stringify(profile));
    }

    public async createChannel(meta: Metadata) {
        return this.publish(Kind.ChannelCreation, [], JSON.stringify(meta));
    }

    public async updateChannel(channel: Channel, meta: Metadata) {
        return this.publish(Kind.ChannelMetadata, [['e', channel.id, this.writeRelays[0]]], JSON.stringify(meta));
    }

    public async deleteEvents(ids: string[], why: string = '') {
        return this.publish(Kind.EventDeletion, [...ids.map(id => ['e', id])], why);
    }

    public async sendPublicMessage(channel: Channel, message: string) {
        return this.publish(Kind.ChannelMessage, [['e', channel.id, this.writeRelays[0], 'root']], message);
    }

    public async sendDirectMessage(toPubkey: string, message: string) {
        const encrypted = await (this.priv === 'nip07' ? window.nostr!.nip04.encrypt(toPubkey, message) : nip04.encrypt(this.priv, toPubkey, message));
        return this.publish(Kind.EncryptedDirectMessage, [['p', toPubkey]], encrypted);
    }

    public async recommendRelay(relay: string) {
        return this.publish(Kind.RecommendRelay, [], relay);
    }

    async publish(kind: number, tags: Array<any>[], content: string) {
        const event: Event = {
            kind,
            tags,
            pubkey: this.pub,
            content,
            created_at: Math.floor(Date.now() / 1000),
            id: '',
            sig: ''
        }

        if (this.priv === 'nip07') {
            return window.nostr?.signEvent(event).then(event => {
                this.pool.publish(this.writeRelays, event);
            });
        }

        event.id = getEventHash(event);
        event.sig = signEvent(event, this.priv);
        this.pool.publish(this.writeRelays, event);
    }

    pushToEventBuffer(event: EventWithRelays) {
        if (!this.ready) {
            clearTimeout(this.readyTimer);
            this.readyTimer = setTimeout(() => {
                this.ready = true;
                this.emit(RavenEvents.Ready);
            }, 1000);
        }

        const cacheKey = `${event.id}_emitted`
        if (this.nameCache[cacheKey] === undefined) {
            if (this.eventQueueFlag) {
                if (this.eventQueueBuffer.length > 0) {
                    this.eventQueue.push(...this.eventQueueBuffer);
                    this.eventQueueBuffer = [];
                }
                clearTimeout(this.eventQueueTimer);
                this.eventQueue.push(event);
                this.eventQueueTimer = setTimeout(() => {
                    this.processEventQueue().then();
                }, 50);
            } else {
                this.eventQueueBuffer.push(event);
            }

            this.nameCache[cacheKey] = 1;
        }
    }

    async processEventQueue() {
        this.eventQueueFlag = false;

        const profileUpdates: Profile[] = this.eventQueue.filter(x => x.kind === Kind.Metadata).map(ev => {
            const content = Raven.parseJson(ev.content);
            return content ? {
                id: ev.id,
                creator: ev.pubkey,
                created: ev.created_at,
                ...Raven.normalizeMetadata(content)
            } : null;
        }).filter(notEmpty);
        if (profileUpdates.length > 0) {
            this.emit(RavenEvents.ProfileUpdate, profileUpdates);
        }

        const channelCreations: Channel[] = this.eventQueue.filter(x => x.kind === Kind.ChannelCreation).map(ev => {
            const content = Raven.parseJson(ev.content);
            return content ? {
                id: ev.id,
                creator: ev.pubkey,
                created: ev.created_at,
                ...Raven.normalizeMetadata(content)
            } : null;
        }).filter(notEmpty);
        if (channelCreations.length > 0) {
            this.emit(RavenEvents.ChannelCreation, channelCreations);
        }

        const channelUpdates: ChannelUpdate[] = this.eventQueue.filter(x => x.kind === Kind.ChannelMetadata).map(ev => {
            const content = Raven.parseJson(ev.content);
            const channelId = ev.tags[0][1];
            if (!channelId) {
                return null;
            }
            return content ? {
                id: ev.id,
                creator: ev.pubkey,
                created: ev.created_at,
                channelId,
                ...Raven.normalizeMetadata(content)
            } : null;
        }).filter(notEmpty);
        if (channelUpdates.length > 0) {
            this.emit(RavenEvents.ChannelUpdate, channelUpdates);
        }

        const deletions: EventDeletion[] = this.eventQueue.filter(x => x.kind === Kind.EventDeletion).map(ev => {
            return {
                eventId: ev.tags[0][1],
                why: ev.content || ''
            };
        }).filter(notEmpty).flat();
        if (deletions.length > 0) {
            this.emit(RavenEvents.EventDeletion, deletions);
        }

        const publicMessages: PublicMessage[] = this.eventQueue.filter(x => x.kind === Kind.ChannelMessage).map(ev => {
                const channelId = ev.tags[0][1];
                if (!channelId) {
                    return null;
                }

                return ev.content ? {
                    id: ev.id,
                    channelId,
                    content: ev.content,
                    creator: ev.pubkey,
                    created: ev.created_at,
                } : null;
            }
        ).filter(notEmpty);
        if (publicMessages.length > 0) {
            this.emit(RavenEvents.PublicMessage, publicMessages);
        }

        Promise.all(this.eventQueue.filter(x => x.kind === Kind.EncryptedDirectMessage).map(ev => {
            const receiver = ev.tags.find(([tag]) => tag === 'p')?.[1];

            if (!receiver) {
                return null;
            }

            const peer = receiver === this.pub ? ev.pubkey : receiver;
            const msg = {
                id: ev.id,
                content: ev.content,
                peer,
                creator: ev.pubkey,
                created: ev.created_at,
                decrypted: false
            };

            if (this.priv === 'nip07') {
                return msg;
            }

            return nip04.decrypt(this.priv, peer, ev.content).then(content => {
                return {
                    ...msg,
                    content,
                    decrypted: true
                }
            });
        }).filter(notEmpty)).then((directMessages: DirectMessage[]) => {
            this.emit(RavenEvents.DirectMessage, directMessages);
        });

        this.eventQueue = [];
        this.eventQueueFlag = true;
    }

    close = () => {
        this.pool.close(this.readRelays);
        this.removeAllListeners();
    }

    static normalizeMetadata(meta: Metadata) {
        return {
            name: meta.name || '',
            about: meta.about || '',
            picture: meta.picture || ''
        }
    }

    static parseJson(d: string) {
        try {
            return JSON.parse(d);
        } catch (e) {
            return null;
        }
    }
}

export default Raven;

export const initRaven = (keys: Keys): Raven | undefined => {
    if (window.raven) {
        window.raven.close();
        window.raven = undefined;
    }

    if (keys) {
        window.raven = new Raven(keys.priv, keys.pub);
    }

    return window.raven;
};
