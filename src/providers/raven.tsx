import React, {useEffect, useMemo, useState} from 'react';
import {useAtom} from 'jotai';
import uniq from 'lodash.uniq';
import {nip19} from 'nostr-tools';

import {
    channelsAtom,
    channelUpdatesAtom,
    directContactsAtom,
    directMessagesAtom,
    eventDeletionsAtom,
    keysAtom,
    profileAtom,
    profilesAtom,
    publicMessagesAtom,
    ravenAtom,
    ravenReadyAtom,
    channelMessageHidesAtom,
    channelUserMutesAtom,
    muteListAtom,
    directMessageAtom,
    reactionsAtom,
    leftChannelListAtom,
    readMarkMapAtom
} from 'atoms';
import {initRaven, RavenEvents} from 'raven/raven';
import {
    Channel,
    ChannelUpdate,
    DirectMessage,
    EventDeletion,
    Profile,
    PublicMessage,
    ChannelMessageHide,
    ChannelUserMute,
    MuteList,
    Reaction,
    ReadMarkMap
} from 'types';
import {createLogger} from 'logger';


const logger = createLogger('RavenProvider');

const RavenProvider = (props: { children: React.ReactNode }) => {
    const [keys] = useAtom(keysAtom);
    const [, setRaven] = useAtom(ravenAtom);
    const [ravenReady, setRavenReady] = useAtom(ravenReadyAtom);
    const [profile, setProfile] = useAtom(profileAtom);
    const [profiles, setProfiles] = useAtom(profilesAtom);
    const [channels, setChannels] = useAtom(channelsAtom);
    const [channelUpdates, setChannelUpdates] = useAtom(channelUpdatesAtom);
    const [eventDeletions, setEventDeletions] = useAtom(eventDeletionsAtom);
    const [publicMessages, setPublicMessages] = useAtom(publicMessagesAtom);
    const [directMessages, setDirectMessages] = useAtom(directMessagesAtom);
    const [directMessage,] = useAtom(directMessageAtom);
    const [channelMessageHides, setChannelMessageHides] = useAtom(channelMessageHidesAtom);
    const [channelUserMutes, setChannelUserMutes] = useAtom(channelUserMutesAtom);
    const [muteList, setMuteList] = useAtom(muteListAtom);
    const [leftChannelList, setLeftChannelList] = useAtom(leftChannelListAtom);
    const [readMarkMap, setReadMarkMap] = useAtom(readMarkMapAtom);
    const [reactions, setReactions] = useAtom(reactionsAtom);
    const [, setDirectContacts] = useAtom(directContactsAtom);
    const [since, setSince] = useState<number>(0)

    const raven = useMemo(() => initRaven(keys), [keys]);

    // Listen for events in an interval.
    useEffect(() => {
        if (!ravenReady) return;

        const timer = setTimeout(() => {
            raven?.listen(channels.map(x => x.id), Math.floor((since || Date.now()) / 1000));
            setSince(Date.now());
        }, since === 0 ? 500 : 10000);

        return () => {
            clearTimeout(timer);
        }
    }, [since, ravenReady, raven, channels]);

    // Trigger listen once the window visibility changes.
    const visibilityChange = () => {
        if (document.visibilityState === 'visible') {
            raven?.listen(channels.map(x => x.id), Math.floor((since || Date.now()) / 1000));
            setSince(Date.now());
        }
    }
    useEffect(() => {
        document.addEventListener('visibilitychange', visibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', visibilityChange);
        }
    }, [since, ravenReady, raven, channels]);


    useEffect(() => {
        setDirectContacts([...new Set(directMessages.map(x => x.peer))].map(p => ({
            pub: p,
            npub: nip19.npubEncode(p)
        })));
    }, [directMessages]);

    // Ready state handler
    const handleReadyState = () => {
        logger.info('handleReadyState');
        setRavenReady(true);
    }

    useEffect(() => {
        raven?.removeListener(RavenEvents.Ready, handleReadyState);
        raven?.addListener(RavenEvents.Ready, handleReadyState);
        return () => {
            raven?.removeListener(RavenEvents.Ready, handleReadyState);
        }
    }, [ravenReady, raven]);

    // Profile update handler
    const handleProfileUpdate = (data: Profile[]) => {
        logger.info('handleProfileUpdate', data);
        setProfiles([
            ...profiles.filter(x => data.find(y => x.creator === y.creator) === undefined),
            ...data
        ]);

        const profile = data.find(x => x.creator === keys!.pub);
        if (profile) {
            setProfile(profile);
        }
    }

    useEffect(() => {
        raven?.removeListener(RavenEvents.ProfileUpdate, handleProfileUpdate);
        raven?.addListener(RavenEvents.ProfileUpdate, handleProfileUpdate);
        return () => {
            raven?.removeListener(RavenEvents.ProfileUpdate, handleProfileUpdate);
        }
    }, [raven, profile, profiles]);

    // Channel creation handler
    const handleChannelCreation = (data: Channel[]) => {
        logger.info('handleChannelCreation', data);
        const append = data.filter(x => channels.find(y => y.id === x.id) === undefined);
        setChannels([...channels, ...append]);
    }

    useEffect(() => {
        raven?.removeListener(RavenEvents.ChannelCreation, handleChannelCreation);
        raven?.addListener(RavenEvents.ChannelCreation, handleChannelCreation);

        return () => {
            raven?.removeListener(RavenEvents.ChannelCreation, handleChannelCreation);
        }
    }, [raven, channels]);

    // Channel update handler
    const handleChannelUpdate = (data: ChannelUpdate[]) => {
        logger.info('handleChannelUpdate', data);
        const append = data.filter(x => channelUpdates.find(y => y.id === x.id) === undefined);
        setChannelUpdates([...channelUpdates, ...append]);
    }

    useEffect(() => {
        raven?.removeListener(RavenEvents.ChannelUpdate, handleChannelUpdate);
        raven?.addListener(RavenEvents.ChannelUpdate, handleChannelUpdate);

        return () => {
            raven?.removeListener(RavenEvents.ChannelUpdate, handleChannelUpdate);
        }
    }, [raven, channelUpdates]);

    // Event deletion handler
    const handleEventDeletion = (data: EventDeletion[]) => {
        logger.info('handleEventDeletion', data);
        const append = data.filter(x => eventDeletions.find(y => y.eventId === x.eventId) === undefined);
        setEventDeletions([...eventDeletions, ...append]);
    }

    useEffect(() => {
        raven?.removeListener(RavenEvents.EventDeletion, handleEventDeletion);
        raven?.addListener(RavenEvents.EventDeletion, handleEventDeletion);

        return () => {
            raven?.removeListener(RavenEvents.EventDeletion, handleEventDeletion);
        }
    }, [raven, eventDeletions]);

    // Public message handler
    const handlePublicMessage = (data: PublicMessage[]) => {
        logger.info('handlePublicMessage', data);
        const append = data.filter(x => publicMessages.find(y => y.id === x.id) === undefined);
        raven?.loadProfiles(append.map(x => x.creator));
        setPublicMessages([...publicMessages, ...append]);
    }

    useEffect(() => {
        raven?.removeListener(RavenEvents.PublicMessage, handlePublicMessage);
        raven?.addListener(RavenEvents.PublicMessage, handlePublicMessage);

        return () => {
            raven?.removeListener(RavenEvents.PublicMessage, handlePublicMessage);
        }
    }, [raven, publicMessages]);

    // Direct message handler
    const handleDirectMessage = (data: DirectMessage[]) => {
        logger.info('handleDirectMessage', data);
        const append = data.filter(x => directMessages.find(y => y.id === x.id) === undefined);
        raven?.loadProfiles(append.map(x => x.peer));
        setDirectMessages([...directMessages, ...append]);
    }

    useEffect(() => {
        raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage);
        raven?.addListener(RavenEvents.DirectMessage, handleDirectMessage);

        return () => {
            raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage);
        }
    }, [raven, directMessages]);

    // Channel message hide handler
    const handlePublicMessageHide = (data: ChannelMessageHide[]) => {
        logger.info('handlePublicMessageHide', data);
        const append = data.filter(x => channelMessageHides.find(y => y.id === x.id) === undefined);
        setChannelMessageHides([...channelMessageHides, ...append]);
    }

    useEffect(() => {
        raven?.removeListener(RavenEvents.ChannelMessageHide, handlePublicMessageHide);
        raven?.addListener(RavenEvents.ChannelMessageHide, handlePublicMessageHide);

        return () => {
            raven?.removeListener(RavenEvents.ChannelMessageHide, handlePublicMessageHide);
        }
    }, [raven, channelMessageHides]);

    // Channel user mute handler
    const handleChannelUserMute = (data: ChannelUserMute[]) => {
        logger.info('handleChannelUserMute', data);
        const append = data.filter(x => channelUserMutes.find(y => y.pubkey === x.pubkey) === undefined);
        setChannelUserMutes([...channelUserMutes, ...append]);
    }

    useEffect(() => {
        raven?.removeListener(RavenEvents.ChannelUserMute, handleChannelUserMute);
        raven?.addListener(RavenEvents.ChannelUserMute, handleChannelUserMute);

        return () => {
            raven?.removeListener(RavenEvents.ChannelUserMute, handleChannelUserMute);
        }
    }, [raven, channelUserMutes]);

    // Mute list handler
    const handleMuteList = (data: MuteList) => {
        logger.info('handleMuteList', data);
        setMuteList(data);
    }

    useEffect(() => {
        raven?.removeListener(RavenEvents.MuteList, handleMuteList);
        raven?.addListener(RavenEvents.MuteList, handleMuteList);

        return () => {
            raven?.removeListener(RavenEvents.MuteList, handleMuteList);
        }
    }, [raven, muteList]);

    // Left channel handler

    const handleLeftChannelList = (data: string[]) => {
        logger.info('handleLeftChannelList', data);
        setLeftChannelList(data);
    }

    useEffect(() => {
        raven?.removeListener(RavenEvents.LeftChannelList, handleLeftChannelList);
        raven?.addListener(RavenEvents.LeftChannelList, handleLeftChannelList);

        return () => {
            raven?.removeListener(RavenEvents.LeftChannelList, handleLeftChannelList);
        }
    }, [raven, leftChannelList]);

    const handleReadMarkMap = (data: ReadMarkMap) => {
        logger.info('handleReadMarkMap', data);
        setReadMarkMap(data);
    }

    useEffect(() => {
        raven?.removeListener(RavenEvents.ReadMarkMap, handleReadMarkMap);
        raven?.addListener(RavenEvents.ReadMarkMap, handleReadMarkMap);

        return () => {
            raven?.removeListener(RavenEvents.ReadMarkMap, handleReadMarkMap);
        }
    }, [raven, readMarkMap]);


    // muteList runtime decryption for nip04 wallet users.
    useEffect(() => {
        if (keys?.priv === 'nip07' && muteList.encrypted) {
            window.nostr?.nip04.decrypt(keys.pub, muteList.encrypted).then(e => JSON.parse(e)).then(resp => {
                setMuteList({
                    pubkeys: uniq(resp.map((x: any) => x?.[1])),
                    encrypted: ''
                })
            })
        }
    }, [muteList, keys]);

    // reaction handler
    const handleReaction = (data: Reaction[]) => {
        logger.info('handleReaction', data);
        const append = data.filter(x => reactions.find(y => y.id === x.id) === undefined);
        raven?.loadProfiles(append.map(x => x.creator));
        setReactions([...reactions, ...append]);
    }

    useEffect(() => {
        raven?.removeListener(RavenEvents.Reaction, handleReaction);
        raven?.addListener(RavenEvents.Reaction, handleReaction);

        return () => {
            raven?.removeListener(RavenEvents.Reaction, handleReaction);
        }
    }, [raven, reactions]);

    // decrypt direct messages one by one to avoid show nip7 wallet dialog many times.
    useEffect(() => {
        if (keys?.priv === 'nip07' && directMessage) {
            const toDecrypt = directMessages.filter(m => m.peer === directMessage).find(x => !x.decrypted);
            if (toDecrypt) {
                window.nostr?.nip04.decrypt(toDecrypt.peer, toDecrypt.content).then(content => {
                    setDirectMessages(directMessages.map(m => {
                        if (m.id === toDecrypt.id) {
                            return {
                                ...m,
                                content,
                                decrypted: true
                            }
                        }
                        return m;
                    }));
                })
            }
        }
    }, [directMessages, directMessage]);

    // Init raven
    useEffect(() => {
        setRaven(raven);

        return () => {
            raven?.removeListener(RavenEvents.Ready, handleReadyState);
            raven?.removeListener(RavenEvents.ProfileUpdate, handleProfileUpdate);
            raven?.removeListener(RavenEvents.ChannelCreation, handleChannelCreation);
            raven?.removeListener(RavenEvents.ChannelUpdate, handleChannelUpdate);
            raven?.removeListener(RavenEvents.EventDeletion, handleEventDeletion);
            raven?.removeListener(RavenEvents.PublicMessage, handlePublicMessage);
            raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage);
            raven?.removeListener(RavenEvents.ChannelMessageHide, handlePublicMessageHide);
            raven?.removeListener(RavenEvents.ChannelUserMute, handleChannelUserMute);
            raven?.removeListener(RavenEvents.MuteList, handleMuteList);
            raven?.removeListener(RavenEvents.LeftChannelList, handleLeftChannelList);
            raven?.removeListener(RavenEvents.ReadMarkMap, handleReadMarkMap);
            raven?.removeListener(RavenEvents.Reaction, handleReaction);
        }
    }, [raven]);

    return <>
        {props.children}
    </>;
}

export default RavenProvider;
