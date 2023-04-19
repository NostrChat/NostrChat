import {Event, Filter, getEventHash, Kind, nip04, signEvent, SimplePool, Sub} from 'nostr-tools';
import {TypedEventEmitter} from 'raven/helper/event-emitter';
import {
    Channel,
    ChannelMessageHide,
    ChannelUpdate,
    ChannelUserMute,
    DirectMessage,
    EventDeletion,
    Keys,
    Metadata,
    MuteList,
    Profile,
    PublicMessage,
    Reaction,
} from 'types';
import chunk from 'lodash.chunk';
import uniq from 'lodash.uniq';
import {getRelays} from 'helper';
import {GLOBAL_CHAT, MESSAGE_PER_PAGE} from 'const';
import {notEmpty} from 'util/misc';

const relays = getRelays();


enum NewKinds {
    MuteList = 10000,
}

export enum RavenEvents {
    Ready = 'ready',
    ProfileUpdate = 'profile_update',
    ChannelCreation = 'channel_creation',
    ChannelUpdate = 'channel_update',
    EventDeletion = 'event_deletion',
    PublicMessage = 'public_message',
    DirectMessage = 'direct_message',
    ChannelMessageHide = 'channel_message_hide',
    ChannelUserMute = 'channel_user_mute',
    MuteList = 'mute_list',
    Reaction = 'reaction'
}

type EventHandlerMap = {
    [RavenEvents.Ready]: () => void;
    [RavenEvents.ProfileUpdate]: (data: Profile[]) => void;
    [RavenEvents.ChannelCreation]: (data: Channel[]) => void;
    [RavenEvents.ChannelUpdate]: (data: ChannelUpdate[]) => void;
    [RavenEvents.EventDeletion]: (data: EventDeletion[]) => void;
    [RavenEvents.PublicMessage]: (data: PublicMessage[]) => void;
    [RavenEvents.DirectMessage]: (data: DirectMessage[]) => void;
    [RavenEvents.ChannelMessageHide]: (data: ChannelMessageHide[]) => void;
    [RavenEvents.ChannelUserMute]: (data: ChannelUserMute[]) => void;
    [RavenEvents.MuteList]: (data: MuteList) => void;
    [RavenEvents.Reaction]: (data: Reaction[]) => void;
};


class Raven extends TypedEventEmitter<RavenEvents, EventHandlerMap> {
    private pool: SimplePool;

    private readonly priv: string | 'nip07';
    private readonly pub: string;

    private readonly readRelays = Object.keys(relays).filter(r => relays[r].read);
    private readonly writeRelays = Object.keys(relays).filter(r => relays[r].write);

    private eventQueue: Event [] = [];
    private eventQueueTimer: any;
    private eventQueueFlag = true;
    private eventQueueBuffer: Event [] = [];

    private nameCache: Record<string, number> = {};

    listenerSub: Sub | null = null;
    messageListenerSub: Sub | null = null;

    constructor(priv: string, pub: string) {
        super();

        this.priv = priv;
        this.pub = pub;

        this.pool = new SimplePool();

        this.init().then();
    }

    private async init() {
        const filters: Filter[] = [{
            kinds: [Kind.Metadata, Kind.EventDeletion, Kind.ChannelCreation],
            authors: [this.pub],
        }, {
            kinds: [Kind.ChannelHideMessage, Kind.ChannelMuteUser],
            authors: [this.pub],
        }, {
            kinds: [NewKinds.MuteList],
            authors: [this.pub],
        }, {
            kinds: [Kind.ChannelMessage],
            authors: [this.pub],
        }, {
            kinds: [Kind.EncryptedDirectMessage],
            authors: [this.pub],
        }, {
            kinds: [Kind.EncryptedDirectMessage],
            '#p': [this.pub]
        }];

        this.fetch(filters).then((resp) => {
            const deletions = resp.filter(x => x.kind === Kind.EventDeletion).map(x => Raven.findTagValue(x, 'e')).filter(notEmpty);
            const events = resp.sort((a, b) => b.created_at - a.created_at);

            const profile = events.find(x => x.kind === Kind.Metadata);
            if (profile) this.pushToEventBuffer(profile);

            const muteList = events.find(x => x.kind.toString() === NewKinds.MuteList.toString());
            if (muteList) this.pushToEventBuffer(muteList);

            for (const e of events.filter(x => [Kind.ChannelHideMessage, Kind.ChannelMuteUser].includes(x.kind))) {
                this.pushToEventBuffer(e);
            }

            const channels = uniq(events.map(x => {
                if (x.kind === Kind.ChannelCreation) {
                    return x.id;
                }

                if (x.kind === Kind.ChannelMessage) {
                    return Raven.findTagValue(x, 'e');
                }

                return null;
            }).filter(notEmpty).filter(x => !deletions.includes(x)).filter(notEmpty));

            if (!channels.includes(GLOBAL_CHAT.id)) {
                channels.push(GLOBAL_CHAT.id)
            }

            const directContacts = uniq(events.map(x => {
                if (x.kind === Kind.EncryptedDirectMessage) {
                    const receiver = Raven.findTagValue(x, 'p');
                    if (!receiver) return null;
                    return receiver === this.pub ? x.pubkey : receiver;
                }

                return null;
            })).filter(notEmpty);

            const filters: Filter[] = [
                {
                    kinds: [Kind.ChannelCreation],
                    ids: channels
                },
                ...channels.map(c => ({
                    kinds: [Kind.ChannelMetadata, Kind.EventDeletion],
                    '#e': [c],
                })),
                ...channels.map(c => ({
                    kinds: [Kind.ChannelMessage],
                    '#e': [c],
                    limit: MESSAGE_PER_PAGE
                })),
                ...directContacts.map(x => ({
                    kinds: [Kind.EncryptedDirectMessage],
                    '#p': [this.pub],
                    authors: [x]
                })),
                ...directContacts.map(x => ({
                    kinds: [Kind.EncryptedDirectMessage],
                    '#p': [x],
                    authors: [this.pub]
                }))
            ];

            chunk(filters, 10).forEach(c => {
                this.sub(c);
            });

            this.emit(RavenEvents.Ready);
        });
    }

    public fetchPrevMessages(channel: string, until: number) {
        return this.fetch([{
            kinds: [Kind.ChannelMessage],
            '#e': [channel],
            until,
            limit: MESSAGE_PER_PAGE
        }], 1000).then(events => {
            events.forEach((ev) => {
                this.pushToEventBuffer(ev)
            });

            return events.length;
        })
    }

    private fetch(filters: Filter[], quitMs: number = 0): Promise<Event[]> {
        return new Promise((resolve) => {
            const sub = this.pool.sub(this.readRelays, filters);
            const events: Event[] = [];

            const quit = () => {
                sub.unsub();
                resolve(events);
            }

            let timer: any = quitMs > 0 ? setTimeout(quit, quitMs) : null;

            sub.on('event', (event) => {
                events.push(event);

                if (quitMs > 0) {
                    clearTimeout(timer);
                    timer = setTimeout(quit, quitMs);
                }
            });

            if (quitMs === 0) {
                sub.on('eose', () => {
                    sub.unsub();
                    resolve(events);
                });
            }
        });
    }

    private sub(filters: Filter[], unsub: boolean = true) {
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

    public loadChannel(id: string) {
        const filters: Filter[] = [
            {
                kinds: [Kind.ChannelCreation],
                ids: [id]
            },
            {
                kinds: [Kind.ChannelMetadata, Kind.EventDeletion],
                '#e': [id],
            },
            {
                kinds: [Kind.ChannelMessage],
                '#e': [id],
                limit: MESSAGE_PER_PAGE
            }
        ];

        this.sub(filters);
    }

    public loadProfiles(pubs: string[]) {
        const authors = uniq(pubs).filter(p => this.nameCache[p] === undefined);
        if (authors.length === 0) {
            return;
        }
        authors.forEach(a => this.nameCache[a] = Date.now());

        chunk(authors, 20).forEach(a => {
            this.sub([{
                kinds: [Kind.Metadata],
                authors: a,
            }])
        });
    }

    public listen(channels: string[], since: number) {
        if (this.listenerSub) {
            this.listenerSub.unsub();
        }

        this.listenerSub = this.sub([{
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
            kinds: [Kind.EncryptedDirectMessage],
            '#p': [this.pub],
            since
        }], false);
    }

    public listenMessages = (messageIds: string[], relIds: string[]) => {
        if (this.messageListenerSub) {
            this.messageListenerSub.unsub();
        }

        const filters: Filter[] = [
            {
                kinds: [
                    Kind.EventDeletion,
                    Kind.ChannelMessage,
                    Kind.Reaction
                ],
                '#e': messageIds,
            },
            ...chunk(relIds, 10).map(c => ({
                    kinds: [
                        Kind.EventDeletion,
                    ],
                    '#e': c,
                }
            ))
        ];
        this.messageListenerSub = this.sub(filters, false);
    }

    private async findHealthyRelay(relays: string[]) {
        for (const relay of relays) {
            try {
                await this.pool.ensureRelay(relay);
                return relay;
            } catch (e) {
            }
        }

        throw new Error("Couldn't find a working relay");
    }

    public async updateProfile(profile: Metadata) {
        return this.publish(Kind.Metadata, [], JSON.stringify(profile));
    }

    public async createChannel(meta: Metadata) {
        return this.publish(Kind.ChannelCreation, [], JSON.stringify(meta));
    }

    public async updateChannel(channel: Channel, meta: Metadata) {
        return this.findHealthyRelay(this.pool.seenOn(channel.id)).then(relay => {
            return this.publish(Kind.ChannelMetadata, [['e', channel.id, relay]], JSON.stringify(meta));
        });
    }

    public async deleteEvents(ids: string[], why: string = '') {
        return this.publish(Kind.EventDeletion, [...ids.map(id => ['e', id])], why);
    }

    public async sendPublicMessage(channel: Channel, message: string, mentions?: string[], parent?: string) {
        const root = parent || channel.id;
        const relay = await this.findHealthyRelay(this.pool.seenOn(root));
        const tags = [['e', root, relay, 'root']];
        if (mentions) {
            mentions.forEach(m => tags.push(['p', m]));
        }
        return this.publish(Kind.ChannelMessage, tags, message);
    }

    public async sendDirectMessage(toPubkey: string, message: string, parent?: string) {
        const encrypted = await (this.priv === 'nip07' ? window.nostr!.nip04.encrypt(toPubkey, message) : nip04.encrypt(this.priv, toPubkey, message));
        const tags = [['p', toPubkey]];
        if (parent) {
            const relay = await this.findHealthyRelay(this.pool.seenOn(parent));
            tags.push(['e', parent, relay, 'root']);
        }
        return this.publish(Kind.EncryptedDirectMessage, tags, encrypted);
    }

    public async recommendRelay(relay: string) {
        return this.publish(Kind.RecommendRelay, [], relay);
    }

    public async hideChannelMessage(id: string, reason: string) {
        return this.publish(Kind.ChannelHideMessage, [['e', id]], JSON.stringify({reason}));
    }

    public async muteChannelUser(pubkey: string, reason: string) {
        return this.publish(Kind.ChannelMuteUser, [['p', pubkey]], JSON.stringify({reason}));
    }

    public async updateMuteList(userIds: string[]) {
        const list = [...userIds.map(id => ['p', id])];
        const content = await (this.priv === 'nip07' ? window.nostr!.nip04.encrypt(this.pub, JSON.stringify(list)) : nip04.encrypt(this.priv, this.pub, JSON.stringify(list)));
        return this.publish(NewKinds.MuteList, [], content);
    }

    public async sendReaction(message: string, pubkey: string, reaction: string) {
        const relay = await this.findHealthyRelay(this.pool.seenOn(message));
        const tags = [['e', message, relay, 'root'], ['p', pubkey]];
        return this.publish(Kind.Reaction, tags, reaction);
    }

    private publish(kind: number, tags: Array<any>[], content: string): Promise<Event> {
        return new Promise((resolve, reject) => {
            this.signEvent({
                kind,
                tags,
                pubkey: this.pub,
                content,
                created_at: Math.floor(Date.now() / 1000),
                id: '',
                sig: ''
            }).then(event => {
                if (!event) {
                    reject("Couldn't sign event!");
                    return;
                }

                const pub = this.pool.publish(this.writeRelays, event);
                pub.on('ok', () => {
                    resolve(event);
                });

                pub.on('failed', () => {
                    reject("Couldn't sign event!");
                })
            }).catch(() => {
                reject("Couldn't sign event!");
            })
        })
    }

    private async signEvent(event: Event): Promise<Event | undefined> {
        if (this.priv === 'nip07') {
            return window.nostr?.signEvent(event);
        } else {
            return {
                ...event,
                id: getEventHash(event),
                sig: signEvent(event, this.priv)
            };
        }
    }

    pushToEventBuffer(event: Event) {
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
            const channelId = Raven.findTagValue(ev, 'e');
            if (!channelId) return null;
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
            const eventId = Raven.findTagValue(ev, 'e');
            if (!eventId) return null;
            return {
                eventId,
                why: ev.content || ''
            };
        }).filter(notEmpty).flat();
        if (deletions.length > 0) {
            this.emit(RavenEvents.EventDeletion, deletions);
        }

        const publicMessages: PublicMessage[] = this.eventQueue.filter(x => x.kind === Kind.ChannelMessage).map(ev => {
                const root = Raven.findNip10MarkerValue(ev, 'root');
                const mentions = Raven.filterTagValue(ev, 'p').map(x => x?.[1]).filter(notEmpty);
                if (!root) return null;
                return ev.content ? {
                    id: ev.id,
                    root,
                    content: ev.content,
                    creator: ev.pubkey,
                    mentions,
                    created: ev.created_at,
                } : null;
            }
        ).filter(notEmpty);
        if (publicMessages.length > 0) {
            this.emit(RavenEvents.PublicMessage, publicMessages);
        }

        Promise.all(this.eventQueue.filter(x => x.kind === Kind.EncryptedDirectMessage).map(ev => {
            const receiver = Raven.findTagValue(ev, 'p');
            if (!receiver) return null;
            const root = Raven.findNip10MarkerValue(ev, 'root');

            const peer = receiver === this.pub ? ev.pubkey : receiver;
            const msg = {
                id: ev.id,
                root,
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

        const channelMessageHides: ChannelMessageHide[] = this.eventQueue.filter(x => x.kind === Kind.ChannelHideMessage).map(ev => {
            const content = Raven.parseJson(ev.content);
            const id = Raven.findTagValue(ev, 'e');
            if (!id) return null;
            return {
                id,
                reason: content?.reason || ''
            };
        }).filter(notEmpty);
        if (channelMessageHides.length > 0) {
            this.emit(RavenEvents.ChannelMessageHide, channelMessageHides);
        }

        const channelUserMutes: ChannelUserMute[] = this.eventQueue.filter(x => x.kind === Kind.ChannelMuteUser).map(ev => {
            const content = Raven.parseJson(ev.content);
            const pubkey = Raven.findTagValue(ev, 'p');
            if (!pubkey) return null;
            return {
                pubkey,
                reason: content?.reason || ''
            };
        }).filter(notEmpty);
        if (channelUserMutes.length > 0) {
            this.emit(RavenEvents.ChannelUserMute, channelUserMutes);
        }

        const muteListEv = this.eventQueue.filter(x => x.kind.toString() === NewKinds.MuteList.toString())
            .sort((a, b) => b.created_at - a.created_at)[0];

        if (muteListEv) {
            const visiblePubkeys = Raven.filterTagValue(muteListEv, 'p').map(x => x?.[1])

            if (muteListEv.content !== '' && this.priv !== 'nip07') {
                nip04.decrypt(this.priv, this.pub, muteListEv.content).then(e => JSON.parse(e)).then(resp => {
                    const allPubkeys = [...visiblePubkeys, ...resp.map((x: any) => x?.[1])];
                    this.emit(RavenEvents.MuteList, {
                        pubkeys: uniq(allPubkeys),
                        encrypted: ''
                    });
                });
            } else {
                this.emit(RavenEvents.MuteList, {
                    pubkeys: visiblePubkeys,
                    encrypted: muteListEv.content.trim()
                });
            }
        }

        const reactions: Reaction[] = this.eventQueue.filter(x => x.kind === Kind.Reaction).map(ev => {
                const message = Raven.findNip10MarkerValue(ev, 'root');
                const peer = Raven.findTagValue(ev, 'p');
                if (!message || !peer || !ev.content) return null;
                return {
                    id: ev.id,
                    message,
                    peer,
                    content: ev.content,
                    creator: ev.pubkey,
                    created: ev.created_at,
                }
            }
        ).filter(notEmpty);
        if (reactions.length > 0) {
            this.emit(RavenEvents.Reaction, reactions);
        }

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

    static findTagValue(ev: Event, tag: 'e' | 'p') {
        return ev.tags.find(([t]) => t === tag)?.[1]
    }

    static filterTagValue(ev: Event, tag: 'e' | 'p') {
        return ev.tags.filter(([t]) => t === tag)
    }

    static findNip10MarkerValue(ev: Event, marker: 'reply' | 'root' | 'mention') {
        const eTags = Raven.filterTagValue(ev, 'e');
        return eTags.find(x => x[3] === marker)?.[1];
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
