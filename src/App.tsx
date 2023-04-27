import React from 'react';
import {Router} from '@reach/router';
import {useAtom} from 'jotai';

import Home from 'views/home';
import Login from 'views/login';
import Channel from 'views/channel';
import ChannelPublic from 'views/channel-public';
import DirectMessage from 'views/direct-message';
import Settings from 'views/settings';
import SettingsProfile from 'views/settings/profile';
import SettingsKeys from 'views/settings/keys';
import SettingsPassword from 'views/settings/password';
import SettingsRelays from 'views/settings/relays';
import {keysAtom} from 'store';

function App() {
    const [keys] = useAtom(keysAtom);

    return <Router style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        <Home path='/'/>
        <Login path='/login'/>
        <Channel path='/channel'/>
        {keys ? <Channel path='/channel/:channel'/> : <ChannelPublic path='/channel/:channel'/>}
        <DirectMessage path='/dm/:npub'/>
        <Settings path='/settings'/>
        <SettingsProfile path='/settings/profile'/>
        <SettingsProfile path='/settings/profile'/>
        <SettingsKeys path='/settings/keys'/>
        <SettingsPassword path='/settings/password'/>
        <SettingsRelays path='/settings/relays'/>
    </Router>
}

export default App;
