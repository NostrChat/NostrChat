import {useMemo} from 'react';
import {useAtom} from 'jotai';
import {
    eventDeletionsAtom,
    publicMessagesAtom,
    channelMessageHidesAtom,
    channelUserMutesAtom,
    muteListAtom
} from 'store';

const useLivePublicMessages = (channelId?: string) => {
    const [messages] = useAtom(publicMessagesAtom);
    const [eventDeletions] = useAtom(eventDeletionsAtom);
    const [channelMessageHides] = useAtom(channelMessageHidesAtom);
    const [channelUserMutes] = useAtom(channelUserMutesAtom);
    const [muteList] = useAtom(muteListAtom);

    return useMemo(() => messages
        .filter(x => x.root === channelId)
        .filter(c => eventDeletions.find(x => x.eventId === c.id) === undefined)
        .filter(c => channelMessageHides.find(x => x.id === c.id) === undefined)
        .filter(c => channelUserMutes.find(x => x.pubkey === c.creator) === undefined)
        .filter(c => muteList.pubkeys.find(x => x === c.creator) === undefined)
        .sort((a, b) => a.created - b.created), [messages, channelId, eventDeletions, channelMessageHides, channelUserMutes, muteList]);
}

export default useLivePublicMessages;
