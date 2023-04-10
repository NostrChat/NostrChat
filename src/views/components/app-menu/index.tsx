import React from 'react';
import ChannelList from 'views/components/app-menu/channel-list';
import DmList from 'views/components/app-menu/dm-list';
import AppMenuBase from 'views/components/app-menu-base';

const AppMenu = () => {
    return <AppMenuBase>
        <ChannelList/>
        <DmList/>
    </AppMenuBase>
}

export default AppMenu;
