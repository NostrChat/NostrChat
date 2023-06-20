import React from 'react';
import {useLocation} from '@reach/router';
import {useAtom} from 'jotai';
import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';

import useTranslation from 'hooks/use-translation';
import useLiveChannels from 'hooks/use-live-channels';
import useLivePublicMessages from 'hooks/use-live-public-messages';
import ChannelAddMenu from 'views/components/app-menu/channel-add-menu';
import ListItem from 'views/components/app-menu/list-item';
import {channelAtom, readMarkMapAtom} from 'atoms';
import {Channel} from 'types';

const ChannelListItem = (props: { c: Channel }) => {
    const {c} = props;

    const location = useLocation();
    const messages = useLivePublicMessages(c.id);
    const [readMarkMap] = useAtom(readMarkMapAtom);
    const [channel] = useAtom(channelAtom);

    const lMessage = messages[messages.length - 1];
    const hasUnread = !!(readMarkMap[c.id] && lMessage && lMessage.created > readMarkMap[c.id]);

    const isSelected = c.id === channel?.id && location.pathname.startsWith('/channel/');

    return <ListItem key={c.id} label={c.name} href={`/channel/${c.id}`} selected={isSelected} hasUnread={hasUnread}/>;
}

const ChannelList = () => {
    const theme = useTheme();
    const [t] = useTranslation();
    const channels = useLiveChannels();

    return <>
        <Box sx={{
            mt: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <Box sx={{
                fontFamily: 'Faktum, sans-serif',
                fontWeight: 'bold',
                color: theme.palette.primary.dark,
            }}>{t('Channels')}</Box>
            <ChannelAddMenu/>
        </Box>
        {(() => {
            if (channels.length === 0) {
                return <Box component='span' sx={{
                    color: theme.palette.primary.dark,
                    fontSize: '85%',
                    opacity: '0.6',
                }}>{t('No channel')}</Box>
            }

            return channels.map(c => <ChannelListItem key={c.id} c={c}/>);
        })()}
    </>
}

export default ChannelList;
