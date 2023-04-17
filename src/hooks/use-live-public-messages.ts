import {useMemo} from 'react';
import {useAtom} from 'jotai';
import {
    eventDeletionsAtom,
    publicMessagesAtom,
    channelMessageHidesAtom,
    channelUserMutesAtom,
    muteListAtom,
    keysAtom,
} from 'store';
import useLiveReactions from 'hooks/use-live-reactions';

const useLivePublicMessages = (channelId?: string) => {
    const [messages] = useAtom(publicMessagesAtom);
    const [eventDeletions] = useAtom(eventDeletionsAtom);
    const [channelMessageHides] = useAtom(channelMessageHidesAtom);
    const [_channelUserMutes] = useAtom(channelUserMutesAtom);
    const [muteList] = useAtom(muteListAtom);
    const [keys] = useAtom(keysAtom);
    const reactions = useLiveReactions();

    // accidentally muted myself -_-
    const channelUserMutes = useMemo(() => _channelUserMutes.filter(x => x.pubkey !== keys?.pub), [_channelUserMutes, keys]);

    const clean = useMemo(() => messages
        .filter(c => eventDeletions.find(x => x.eventId === c.id) === undefined)
        .filter(c => channelMessageHides.find(x => x.id === c.id) === undefined)
        .filter(c => channelUserMutes.find(x => x.pubkey === c.creator) === undefined)
        .filter(c => muteList.pubkeys.find(x => x === c.creator) === undefined)
        .map(c => ({...c, reactions: reactions.filter(r => r.message === c.id)}))
        .sort((a, b) => a.created - b.created), [messages, eventDeletions, channelMessageHides, channelUserMutes, muteList, reactions]);

    return useMemo(() => clean
        .filter(c => c.root === channelId)
        .map(c => ({...c, children: clean.filter(x => x.root === c.id)})), [clean, channelId]);
}

export default useLivePublicMessages;
