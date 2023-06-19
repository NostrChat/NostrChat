import React, {useEffect} from 'react';
import {Router} from '@reach/router';
import {useAtom} from 'jotai';

import Home from 'views/home';
import Login from 'views/login';
import Channel from 'views/channel';
import ChannelPublic from 'views/channel-public';
import DirectMessage from 'views/direct-message';
import DirectMessagePublic from 'views/direct-message-public';
import Settings from 'views/settings';
import SettingsProfile from 'views/settings/profile';
import SettingsKeys from 'views/settings/keys';
import SettingsPassword from 'views/settings/password';
import SettingsRelays from 'views/settings/relays';
import SettingsPublicLinkPage from 'views/settings/public-link';
import {keysAtom} from 'store';
import {getKeys} from 'storage';

function App() {
    const [keys, setKeys] = useAtom(keysAtom);

    useEffect(() => {
       getKeys().then(setKeys);
    }, []);

    if (keys === undefined) return null; // Wait until we find key from storage

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
        {keys ? <DirectMessage path='/dm/:npub'/> : <DirectMessagePublic path='/dm/:npub'/>}
        <Settings path='/settings'/>
        <SettingsProfile path='/settings/profile'/>
        <SettingsProfile path='/settings/profile'/>
        <SettingsKeys path='/settings/keys'/>
        <SettingsPassword path='/settings/password'/>
        <SettingsRelays path='/settings/relays'/>
        <SettingsPublicLinkPage path='/settings/public-link'/>
    </Router>
}

export default App;
