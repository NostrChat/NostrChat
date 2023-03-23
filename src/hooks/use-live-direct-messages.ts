import {useMemo} from 'react';
import {useAtom} from 'jotai';
import {directMessagesAtom, eventDeletionsAtom} from 'store';

const useLiveDirectMessages = (peer?: string) => {
    const [directMessages] = useAtom(directMessagesAtom);
    const [eventDeletions] = useAtom(eventDeletionsAtom);

    return useMemo(() => directMessages.filter(c => eventDeletions.find(x => x.eventId === c.id) === undefined).filter(x => x.peer === peer).sort((a, b) => a.created - b.created), [directMessages, peer, eventDeletions]);
}

export default useLiveDirectMessages;
