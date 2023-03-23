import React from 'react';
import {Router} from '@reach/router';

import Home from 'views/home';
import Login from 'views/login';
import Welcome from 'views/welcome';
import Channel from 'views/channel';
import DirectMessage from 'views/direct-message';
import Settings from 'views/settings';
import SettingsProfile from 'views/settings/profile';
import SettingsKeys from 'views/settings/keys';
import SettingsPassword from 'views/settings/password';
import SettingsRelays from 'views/settings/relays';

function App() {
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
        <Welcome path='/welcome'/>
        <Channel path='/channel'/>
        <Channel path='/channel/:channel'/>
        <DirectMessage path='/dm/:pub'/>
        <Settings path='/settings'/>
        <SettingsProfile path='/settings/profile'/>
        <SettingsProfile path='/settings/profile'/>
        <SettingsKeys path='/settings/keys'/>
        <SettingsPassword path='/settings/password'/>
        <SettingsRelays path='/settings/relays'/>
    </Router>
}

export default App;
