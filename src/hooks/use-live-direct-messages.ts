import {useMemo} from 'react';
import {useAtom} from 'jotai';
import {directMessagesAtom, eventDeletionsAtom, muteListAtom} from 'store';
import useLiveReactions from 'hooks/use-live-reactions';

const useLiveDirectMessages = (peer?: string) => {
    const [directMessages] = useAtom(directMessagesAtom);
    const [eventDeletions] = useAtom(eventDeletionsAtom);
    const [muteList] = useAtom(muteListAtom);
    const reactions = useLiveReactions();

    const clean = useMemo(() => directMessages
        .filter(x => x.peer === peer)
        .filter(c => eventDeletions.find(x => x.eventId === c.id) === undefined)
        .filter(c => muteList.pubkeys.find(x => x === c.creator) === undefined)
        .map(c => ({...c, reactions: reactions.filter(r => r.message === c.id)}))
        .sort((a, b) => a.created - b.created), [directMessages, peer, eventDeletions, muteList, reactions]);

    return useMemo(() => clean
        .map(c => ({...c, children: clean.filter(x => x.root === c.id)}))
        .filter(x => !x.root), [clean]);
}

export default useLiveDirectMessages;
