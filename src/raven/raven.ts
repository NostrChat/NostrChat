import {Event, Filter, getEventHash, Kind, nip04, signEvent, SimplePool} from 'nostr-tools';
import {TypedEventEmitter} from 'raven/helper/event-emitter';
import * as Comlink from 'comlink';
import {
    PrivKey,
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
    ReadMarkMap,
    RelayDict,
} from 'types';
import chunk from 'lodash.chunk';
import uniq from 'lodash.uniq';
import {BgRaven} from 'raven/worker';
import {getRelays} from 'local-storage';
import {GLOBAL_CHAT, MESSAGE_PER_PAGE} from 'const';
import {notEmpty} from 'util/misc';
import {isSha256} from 'util/crypto';

let relays: RelayDict;
getRelays().then(r => {
    relays = r;
});


enum NewKinds {
    MuteList = 10000,
    Arbitrary = 30078
}

export enum RavenEvents {
    Ready = 'ready',
    DMsDone = 'dms_done',
    SyncDone = 'sync_done',
    ProfileUpdate = 'profile_update',
    ChannelCreation = 'channel_creation',
    ChannelUpdate = 'channel_update',
    EventDeletion = 'event_deletion',
    PublicMessage = 'public_message',
    DirectMessage = 'direct_message',
    ChannelMessageHide = 'channel_message_hide',
    ChannelUserMute = 'channel_user_mute',
    MuteList = 'mute_list',
    LeftChannelList = 'left_channel_list',
    Reaction = 'reaction',
    ReadMarkMap = 'read_mark_map'
}

type EventHandlerMap = {
    [RavenEvents.Ready]: () => void;
    [RavenEvents.DMsDone]: () => void;
    [RavenEvents.SyncDone]: () => void;
    [RavenEvents.ProfileUpdate]: (data: Profile[]) => void;
    [RavenEvents.ChannelCreation]: (data: Channel[]) => void;
    [RavenEvents.ChannelUpdate]: (data: ChannelUpdate[]) => void;
    [RavenEvents.EventDeletion]: (data: EventDeletion[]) => void;
    [RavenEvents.PublicMessage]: (data: PublicMessage[]) => void;
    [RavenEvents.DirectMessage]: (data: DirectMessage[]) => void;
    [RavenEvents.ChannelMessageHide]: (data: ChannelMessageHide[]) => void;
    [RavenEvents.ChannelUserMute]: (data: ChannelUserMute[]) => void;
    [RavenEvents.MuteList]: (data: MuteList) => void;
    [RavenEvents.LeftChannelList]: (data: string[]) => void;
    [RavenEvents.Reaction]: (data: Reaction[]) => void;
    [RavenEvents.ReadMarkMap]: (data: ReadMarkMap) => void;
};


class Raven extends TypedEventEmitter<RavenEvents, EventHandlerMap> {
    private readonly worker: Worker;
    private bgRaven: Comlink.Remote<BgRaven>;

    private readonly priv: PrivKey;
    private readonly pub: string;

    private readonly readRelays = Object.keys(relays).filter(r => relays[r].read);
    private readonly writeRelays = Object.keys(relays).filter(r => relays[r].write);

    private eventQueue: Event [] = [];
    private eventQueueTimer: any;
    private eventQueueFlag = true;
    private eventQueueBuffer: Event [] = [];

    private nameCache: Record<string, number> = {};

    listenerSub: string | null = null;
    messageListenerSub: string | null = null;

    constructor(priv: string, pub: string) {
        super();

        this.priv = priv;
        this.pub = pub;

        // Raven is all about relay/pool management through websockets using timers.
        // Browsers (chrome) slows down timer tasks when the window goes to inactive.
        // That is why we use a web worker to read data from relays.
        this.worker = new Worker(new URL('worker.ts', import.meta.url))
        this.bgRaven = Comlink.wrap<BgRaven>(this.worker);
        this.bgRaven.setup(this.readRelays).then();

        if (priv && pub) this.init().then();
    }

    private async init() {
        // 1- Get all event created by the user
        const events = await this.fetch([{
            authors: [this.pub],
        }]);
        events
            .filter(e => e.kind !== Kind.ChannelMessage) // public messages comes with channel requests
            .forEach(e => this.pushToEventBuffer(e));
        this.emit(RavenEvents.Ready);

        // 2- Get all incoming DMs to the user
        const incomingDms = await this.fetch([{
            kinds: [Kind.EncryptedDirectMessage],
            '#p': [this.pub]
        }]);
        incomingDms.forEach(e => this.pushToEventBuffer(e));
        this.emit(RavenEvents.DMsDone);

        // 3- Get channels messages
        // Build channel ids
        const deletions = events.filter(x => x.kind === Kind.EventDeletion).map(x => Raven.findTagValue(x, 'e')).filter(notEmpty);

        const channelIds = uniq(events.map(x => {
            if (x.kind === Kind.ChannelCreation) {
                return x.id;
            }

            if (x.kind === Kind.ChannelMessage) {
                return Raven.findTagValue(x, 'e');
            }

            return null;
        }).filter(notEmpty).filter(x => !deletions.includes(x)).filter(notEmpty));

        if (!channelIds.includes(GLOBAL_CHAT.id)) {
            channelIds.push(GLOBAL_CHAT.id)
        }

        // Get real channel list over the channel list collected from channel creations + public messages sent.
        const channels = await this.fetch([
            ...chunk(channelIds, 10).map(x => ({
                kinds: [Kind.ChannelCreation],
                ids: x
            }))
        ]);
        channels.forEach(x => this.pushToEventBuffer(x));

        // Get messages for all channels found
        const filters = [
            ...chunk(channels.map(x => x.id), 6).map(x => ([
                {
                    kinds: [Kind.ChannelMetadata, Kind.EventDeletion],
                    '#e': x,
                },
                {
                    kinds: [Kind.ChannelMessage],
                    '#e': x,
                    limit: MESSAGE_PER_PAGE
                }
            ])).flat()
        ];
        const promises = chunk(filters, 4).map(f => this.fetch(f).then(events => events.forEach(ev => this.pushToEventBuffer(ev))));
        await Promise.all(promises);

        this.emit(RavenEvents.SyncDone);
    }

    public isSyntheticPrivKey = () => {
        return this.priv === 'nip07' || this.priv === 'none';
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

    public async fetchChannel(id: string): Promise<Channel | null> {
        const filters: Filter[] = [
            {
                kinds: [Kind.ChannelCreation],
                ids: [id]
            },
            {
                kinds: [Kind.ChannelMetadata, Kind.EventDeletion],
                '#e': [id],
            }
        ];

        const events = await this.fetch(filters);
        if (events.length === 0) return null; // Not found

        const creation = events.find(x => x.kind === Kind.ChannelCreation);
        if (!creation) return null; // Not found

        if (events.find(x => x.kind === Kind.EventDeletion && x.pubkey === creation.pubkey)) return null;  // Deleted

        const update = events.filter(x => x.kind === Kind.ChannelMetadata && x.pubkey === creation.pubkey).sort((a, b) => b.created_at - a.created_at)[0] // Find latest metadata update

        const content = Raven.parseJson((update || creation).content);
        if (!content) return null;  // Invalid content

        return {
            id: creation.id,
            creator: creation.pubkey,
            created: creation.created_at,
            ...Raven.normalizeMetadata(content)
        }
    }

    public async fetchProfile(pub: string): Promise<Profile | null> {
        const filters: Filter[] = [{
            kinds: [Kind.Metadata],
            authors: [pub],
        }];

        const ev = (await this.fetch(filters)).sort((a, b) => b.created_at - a.created_at)[0];
        if (!ev) return null; // Not found

        const content = Raven.parseJson(ev.content);
        if (!content) return null;  // Invalid content

        return {
            id: ev.id,
            creator: ev.pubkey,
            created: ev.created_at,
            ...Raven.normalizeMetadata(content),
            nip05: content.nip05
        }
    }

    private fetch(filters: Filter[], quitMs: number = 0): Promise<Event[]> {
        return this.bgRaven.fetch(filters, quitMs);
    }

    private sub(filters: Filter[], unsub: boolean = true) {
        return this.bgRaven.sub(filters, Comlink.proxy((e: Event) => {
            this.pushToEventBuffer(e);
        }), unsub);
    }

    private unsub(subId: string) {
        return this.bgRaven.unsub(subId);
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
            this.unsub(this.listenerSub).then();
        }

        this.sub([{
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
        }], false).then((id) => {
            this.listenerSub = id
        });
    }

    public listenMessages = (messageIds: string[], relIds: string[]) => {
        if (this.messageListenerSub) {
            this.unsub(this.messageListenerSub).then();
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

        this.sub(filters, false).then(r => {
            this.messageListenerSub = r;
        });
    }

    public async updateProfile(profile: Metadata) {
        const filters: Filter[] = [{
            kinds: [Kind.Metadata],
            authors: [this.pub],
        }];
        const latestEv = (await this.fetch(filters)).sort((a, b) => b.created_at - a.created_at)[0];
        const latest = latestEv?.content ? Raven.parseJson(latestEv?.content) : '';
        const update = latest.constructor === Object ? {...latest, ...profile} : {...profile};
        return this.publish(Kind.Metadata, [], JSON.stringify(update));
    }

    public async createChannel(meta: Metadata) {
        return this.publish(Kind.ChannelCreation, [], JSON.stringify(meta));
    }

    public async updateChannel(channel: Channel, meta: Metadata) {
        return this.bgRaven.where(channel.id).then(relay => {
            return this.publish(Kind.ChannelMetadata, [['e', channel.id, relay]], JSON.stringify(meta));
        });
    }

    public async deleteEvents(ids: string[], why: string = '') {
        return this.publish(Kind.EventDeletion, [...ids.map(id => ['e', id])], why);
    }

    public async sendPublicMessage(channel: Channel, message: string, mentions?: string[], parent?: string) {
        const root = parent || channel.id;
        const relay = await this.bgRaven.where(root);
        const tags = [['e', root, relay, 'root']];
        if (mentions) {
            mentions.forEach(m => tags.push(['p', m]));
        }
        return this.publish(Kind.ChannelMessage, tags, message);
    }

    public async sendDirectMessage(toPubkey: string, message: string, mentions?: string[], parent?: string) {
        const encrypted = await this.encrypt(toPubkey, message);
        const tags = [['p', toPubkey]];
        if (mentions) {
            mentions.forEach(m => tags.push(['p', m]));
        }
        if (parent) {
            const relay = await this.bgRaven.where(parent);
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
        const content = await this.encrypt(this.pub, JSON.stringify(list));
        return this.publish(NewKinds.MuteList, [], content);
    }

    public async sendReaction(message: string, pubkey: string, reaction: string) {
        const relay = await this.bgRaven.where(message);
        const tags = [['e', message, relay, 'root'], ['p', pubkey]];
        return this.publish(Kind.Reaction, tags, reaction);
    }

    public async updateLeftChannelList(channelIds: string[]) {
        const tags = [['d', 'left-channel-list']];
        return this.publish(NewKinds.Arbitrary, tags, JSON.stringify(channelIds));
    }

    public async updateReadMarkMap(map: ReadMarkMap) {
        const tags = [['d', 'read-mark-map']];
        return this.publish(NewKinds.Arbitrary, tags, JSON.stringify(map));
    }

    private publish(kind: number, tags: Array<any>[], content: string): Promise<Event> {
        return new Promise((resolve, reject) => {
            const pool = new SimplePool();

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

                this.pushToEventBuffer(event);

                let resolved = false;
                const okRelays: string[] = [];
                const failedRelays: string[] = [];

                const pub = pool.publish(this.writeRelays, event);

                const closePool = () => {
                    if ([...okRelays, ...failedRelays].length === this.writeRelays.length) {
                        pool.close(this.writeRelays);
                    }
                }

                pub.on('ok', (r: string) => {
                    okRelays.push(r);
                    if (!resolved) {
                        resolve(event);
                        resolved = true;
                    }
                    closePool();
                });

                pub.on('failed', (r: string) => {
                    failedRelays.push(r);
                    if (failedRelays.length === this.writeRelays.length) {
                        reject("Event couldn't be published on any relay!");
                    }
                    closePool();
                })
            }).catch(() => {
                reject("Couldn't publish event!");
            }).finally(() => {
                pool.close(this.writeRelays);
            })
        })
    }

    private async encrypt(pubkey: string, content: string) {
        if (this.priv === 'nip07') {
            return window.nostr!.nip04.encrypt(pubkey, content);
        } else {
            const priv = this.priv === 'none' ? await window.requestPrivateKey({pubkey, content}) : this.priv;
            return nip04.encrypt(priv, pubkey, content);
        }
    }

    private async signEvent(event: Event): Promise<Event | undefined> {
        if (this.priv === 'nip07') {
            return window.nostr?.signEvent(event);
        } else {
            const priv = this.priv === 'none' ? await window.requestPrivateKey(event) : this.priv;
            return {
                ...event,
                id: getEventHash(event),
                sig: signEvent(event, priv)
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
            if (!content) return null;
            return {
                id: ev.id,
                creator: ev.pubkey,
                created: ev.created_at,
                ...Raven.normalizeMetadata(content),
                nip05: content.nip05
            };
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
                    mentions: uniq(mentions),
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
            const mentions = Raven.filterTagValue(ev, 'p').map(x => x?.[1]).filter(notEmpty);

            const peer = receiver === this.pub ? ev.pubkey : receiver;
            const msg = {
                id: ev.id,
                root,
                content: ev.content,
                peer,
                creator: ev.pubkey,
                mentions: uniq(mentions),
                created: ev.created_at,
                decrypted: false
            };

            if (this.isSyntheticPrivKey()) {
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

            if (muteListEv.content !== '' && !this.isSyntheticPrivKey()) {
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

        const leftChannelListEv = this.eventQueue.filter(x => x.kind.toString() === NewKinds.Arbitrary.toString() && Raven.findTagValue(x, 'd') === 'left-channel-list')
            .sort((a, b) => b.created_at - a.created_at)[0];

        if (leftChannelListEv) {
            const content = Raven.parseJson(leftChannelListEv.content);
            if (Array.isArray(content) && content.every(x => isSha256(x))) {
                this.emit(RavenEvents.LeftChannelList, content);
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

        const readMarkMapEv = this.eventQueue.filter(x => x.kind.toString() === NewKinds.Arbitrary.toString() && Raven.findTagValue(x, 'd') === 'read-mark-map')
            .sort((a, b) => b.created_at - a.created_at)[0];

        if (readMarkMapEv) {
            const content = Raven.parseJson(readMarkMapEv.content);
            if (typeof content === 'object' && Object.keys(content).every(x => isSha256(x))) {
                this.emit(RavenEvents.ReadMarkMap, content);
            }
        }

        this.eventQueue = [];
        this.eventQueueFlag = true;
    }

    close = () => {
        this.worker.terminate();
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

    static findTagValue(ev: Event, tag: 'e' | 'p' | 'd') {
        return ev.tags.find(([t]) => t === tag)?.[1]
    }

    static filterTagValue(ev: Event, tag: 'e' | 'p' | 'd') {
        return ev.tags.filter(([t]) => t === tag)
    }

    static findNip10MarkerValue(ev: Event, marker: 'reply' | 'root' | 'mention') {
        const eTags = Raven.filterTagValue(ev, 'e');
        return eTags.find(x => x[3] === marker)?.[1];
    }
}

export default Raven;

export const initRaven = (keys: Keys | undefined): Raven | undefined => {
    if (window.raven) {
        window.raven.close();
        window.raven = undefined;
    }

    if (keys) {
        window.raven = new Raven(keys.priv, keys.pub);
    }

    return window.raven;
};
