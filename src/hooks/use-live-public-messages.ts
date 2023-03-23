import {useMemo} from 'react';
import {useAtom} from 'jotai';
import {eventDeletionsAtom, publicMessagesAtom} from 'store';

const useLivePublicMessages = (channelId?: string) => {
    const [messages] = useAtom(publicMessagesAtom);
    const [eventDeletions] = useAtom(eventDeletionsAtom);

    return useMemo(() => messages.filter(c => eventDeletions.find(x => x.eventId === c.id) === undefined).filter(x => x.channelId === channelId).sort((a, b) => a.created - b.created), [messages, channelId, eventDeletions]);
}

export default useLivePublicMessages;
