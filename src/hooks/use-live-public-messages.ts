import {useMemo} from 'react';
import {useAtom} from 'jotai';
import {
    eventDeletionsAtom,
    publicMessagesAtom,
    channelMessageHidesAtom,
    channelUserMutesAtom,
    muteListAtom,
    keysAtom,
    reactionsAtom
} from 'store';

const useLivePublicMessages = (channelId?: string) => {
    const [messages] = useAtom(publicMessagesAtom);
    const [eventDeletions] = useAtom(eventDeletionsAtom);
    const [channelMessageHides] = useAtom(channelMessageHidesAtom);
    const [_channelUserMutes] = useAtom(channelUserMutesAtom);
    const [muteList] = useAtom(muteListAtom);
    const [keys] = useAtom(keysAtom);
    const [reactions] = useAtom(reactionsAtom);

    // accidentally muted myself -_-
    const channelUserMutes = useMemo(() => _channelUserMutes.filter(x => x.pubkey !== keys?.pub), [_channelUserMutes, keys]);

    const clean = useMemo(() => messages
        .filter(c => eventDeletions.find(x => x.eventId === c.id) === undefined)
        .filter(c => channelMessageHides.find(x => x.id === c.id) === undefined)
        .filter(c => channelUserMutes.find(x => x.pubkey === c.creator) === undefined)
        .filter(c => muteList.pubkeys.find(x => x === c.creator) === undefined)
        .sort((a, b) => a.created - b.created), [messages, eventDeletions, channelMessageHides, channelUserMutes, muteList]);

    return useMemo(() => clean
        .filter(c => c.root === channelId)
        .map(c => ({...c, children: clean.filter(x => x.root === c.id)}))
        .map(c => ({...c, reactions: reactions.filter(r => r.message === c.id)})), [clean, reactions, channelId]);
}

export default useLivePublicMessages;
