import {useAtom} from 'jotai';
import {channelsAtom, channelUpdatesAtom, eventDeletionsAtom, publicMessagesAtom} from 'store';

const useLiveChannels = () => {
    const [channels] = useAtom(channelsAtom);
    const [channelUpdates] = useAtom(channelUpdatesAtom);
    const [eventDeletions] = useAtom(eventDeletionsAtom);
    const [publicMessages] = useAtom(publicMessagesAtom);

    return channels.map(c => {
        const updated = channelUpdates.filter(x => x.channelId === c.id).sort((a, b) => b.created - a.created)[0];
        if (updated) {
            return Object.assign(c, {
                name: updated.name,
                about: updated.about,
                picture: updated.picture,
                donate: updated.donate
            });
        }

        return c;
    }).filter(c => eventDeletions.find(x => x.eventId === c.id) === undefined).sort((a, b) => {
        const aLastMessage = publicMessages.filter(x => x.root === a.id).sort((a, b) => b.created - a.created)[0]?.created;
        const bLastMessage = publicMessages.filter(x => x.root === b.id).sort((a, b) => b.created - a.created)[0]?.created;
        return (bLastMessage || 0) - (aLastMessage || 0);
    })

}

export default useLiveChannels;
