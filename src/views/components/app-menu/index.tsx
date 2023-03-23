import React from 'react';
import Box from '@mui/material/Box';
import UserMenu from 'views/components/app-menu/user-menu';
import ChannelList from 'views/components/app-menu/channel-list';
import DmList from 'views/components/app-menu/dm-list';
import BottomMenu from 'views/components/app-menu/bottom-menu';
import AppMenuBase from 'views/components/app-menu-base';

const AppMenu = () => {
    return <AppMenuBase children={
        <>
            <UserMenu/>
            <ChannelList/>
            <DmList/>
        </>
    } children2={
        <Box sx={{
            flexGrow: 0,
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'center',
            padding: '12px'
        }}>
            <BottomMenu/>
        </Box>
    }/>
}

export default AppMenu;
