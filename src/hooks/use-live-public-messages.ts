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

    const clean = useMemo(() => messages
        .filter(c => c.root === channelId)
        .filter(c => eventDeletions.find(x => x.eventId === c.id) === undefined)
        .filter(c => channelMessageHides.find(x => x.id === c.id) === undefined)
        .filter(c => channelUserMutes.find(x => x.pubkey === c.creator) === undefined)
        .filter(c => muteList.pubkeys.find(x => x === c.creator) === undefined)
        .sort((a, b) => a.created - b.created), [messages, channelId, eventDeletions, channelMessageHides, channelUserMutes, muteList]);

    const children = clean.filter(c => c.parent !== undefined);

    return clean.filter(c => c.parent === undefined)
        .map(x => ({
            ...x,
            children: children.filter(y => y.parent === x.id)
        }));
}

export default useLivePublicMessages;
