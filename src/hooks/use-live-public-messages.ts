import {useMemo} from 'react';
import {useAtom} from 'jotai';
import {eventDeletionsAtom, publicMessagesAtom, publicMessageHidesAtom} from 'store';

const useLivePublicMessages = (channelId?: string) => {
    const [messages] = useAtom(publicMessagesAtom);
    const [eventDeletions] = useAtom(eventDeletionsAtom);
    const [publicMessageHides] = useAtom(publicMessageHidesAtom);

    return useMemo(() => messages
        .filter(x => x.channelId === channelId)
        .filter(c => eventDeletions.find(x => x.eventId === c.id) === undefined)
        .filter(c => publicMessageHides.find(x => x.id === c.id) === undefined)
        .sort((a, b) => a.created - b.created), [messages, channelId, eventDeletions, publicMessageHides]);
}

export default useLivePublicMessages;
