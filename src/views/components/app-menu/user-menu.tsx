import React from 'react';
import {useAtom} from 'jotai';
import {useNavigate} from '@reach/router';
import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {nip19} from 'nostr-tools';

import Avatar from 'views/components/avatar';
import {keysAtom, profileAtom} from 'store';
import {truncateMiddle} from 'util/truncate';


const UserMenu = () => {
    const [profile] = useAtom(profileAtom);
    const theme = useTheme();
    const [keys] = useAtom(keysAtom);
    const navigate = useNavigate();

    if (!keys) {
        return null;
    }

    const clicked = () => {
        navigate('/settings').then();
    }

    return <Box sx={{
        height: '88px',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0
    }}>
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            background: theme.palette.divider,
            borderRadius: theme.shape.borderRadius,
            cursor: 'pointer',
            transition: 'background-color 100ms linear',
            border: '1px solid transparent',
            ':hover': {
                background: 'transparent',
                border: `1px solid ${theme.palette.divider}`
            }
        }} onClick={clicked}>
            <Box sx={{mr: '8px', display: 'flex'}}>
                <Avatar src={profile?.picture} seed={keys.pub} size={42} rounded/>
            </Box>
            {(() => {

                const sx = {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    width: '184px',
                    mr: '6px',
                }

                if (profile?.name) {
                    return <Box sx={{
                        ...sx,
                        fontFamily: 'Faktum, sans-serif',
                        fontWeight: 'bold',

                    }}>{profile.name || ''}</Box>
                }

                return <Box sx={{
                    ...sx,
                    fontSize: '90%',
                    color: theme.palette.primary.dark,
                    opacity: '0.6',
                }}>{truncateMiddle(nip19.npubEncode(keys.pub), 20, ':')}</Box>
            })()}
        </Box>
    </Box>
}

export default UserMenu;
