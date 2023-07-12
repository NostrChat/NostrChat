import {useMemo} from 'react';
import {useAtom} from 'jotai';
import {
    eventDeletionsAtom,
    reactionsAtom
} from 'atoms';

const useLiveReactions = () => {
    const [eventDeletions] = useAtom(eventDeletionsAtom);
    const [reactions] = useAtom(reactionsAtom);

    return useMemo(() => reactions
        .filter(c => eventDeletions.find(x => x.eventId === c.id) === undefined)
        .sort((a, b) => b.created - a.created), [reactions, eventDeletions]);
}

export default useLiveReactions;
