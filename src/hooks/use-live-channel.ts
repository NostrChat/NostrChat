import {useAtom} from 'jotai';
import {channelAtom, channelUpdatesAtom, eventDeletionsAtom, leftChannelListAtom} from 'atoms';

const useLiveChannel = () => {
    const [channel] = useAtom(channelAtom);
    const [channelUpdates] = useAtom(channelUpdatesAtom);
    const [eventDeletions] = useAtom(eventDeletionsAtom);
    const [leftChannelList] = useAtom(leftChannelListAtom);

    if (!channel) {
        return null;
    }

    if (leftChannelList.includes(channel.id)) {
        return null;
    }

    if (eventDeletions.find(x => x.eventId === channel.id) !== undefined) {
        return null;
    }

    const updated = channelUpdates.filter(x => x.channelId === channel.id).sort((a, b) => b.created - a.created)[0];
    if (updated && channel.creator === updated.creator) {
        return {
            ...channel,
            name: updated.name,
            about: updated.about,
            picture: updated.picture
        }
    }

    return channel;
}

export default useLiveChannel;
