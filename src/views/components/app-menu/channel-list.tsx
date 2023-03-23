import React from 'react';
import {useLocation} from '@reach/router';
import {useAtom} from 'jotai';
import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';

import useTranslation from 'hooks/use-translation';
import useLiveChannels from 'hooks/use-live-channels';
import ChannelAddMenu from 'views/components/app-menu/channel-add-menu';
import ListItem from 'views/components/app-menu/list-item';
import {channelAtom} from 'store';


const ChannelList = () => {
    const theme = useTheme();
    const [t] = useTranslation();
    const location = useLocation();
    const channels = useLiveChannels();
    const [channel] = useAtom(channelAtom);

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

        {channels.map(c => {
            const isSelected = c.id === channel?.id && location.pathname.startsWith('/channel/');
            return <ListItem key={c.id} label={c.name} href={`/channel/${c.id}`} selected={isSelected}/>;
        })}
    </>
}

export default ChannelList;
