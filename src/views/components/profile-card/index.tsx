import {useAtom} from 'jotai';
import React, {useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import {TextField} from '@mui/material';
import {nip19} from 'nostr-tools';
import useTranslation from 'hooks/use-translation';
import Avatar from 'views/components/avatar';
import CopyToClipboard from 'components/copy-clipboard';
import {keysAtom, ravenAtom} from 'store';
import {Profile} from 'types';
import KeyVariant from 'svg/key-variant';
import {truncate, truncateMiddle} from 'util/truncate';

const ProfileCard = (props: { profile?: Profile, pubkey: string, onDM: () => void }) => {
    const {profile, pubkey, onDM} = props;
    const [keys] = useAtom(keysAtom);
    const [raven] = useAtom(ravenAtom);
    const theme = useTheme();
    const [t] = useTranslation();
    const [message, setMessage] = useState('');

    const profileName = useMemo(() => profile?.name ? truncateMiddle(profile.name, 24, ':') : null, [profile]);
    const pub = useMemo(() => nip19.npubEncode(pubkey), [pubkey]);

    return <Box sx={{fontSize: '0.8em'}}>
        <Box sx={{
            mb: '10px',
            display: 'flex'
        }}>
            <Avatar src={profile?.picture} seed={pubkey} size={200} type="user"/>
        </Box>
        {profileName && (<Box sx={{mb: '10px', fontWeight: 600}}>{profileName}</Box>)}
        {profile?.about && (
            <Box sx={{
                mb: '10px',
                wordBreak: 'break-word',
                lineHeight: '1.4em',
                fontSize: '0.9em',
                color: theme.palette.text.secondary
            }}>{truncate(profile.about, 94)}</Box>
        )}
        <CopyToClipboard copy={pub}>
            <Box sx={{
                mb: '16px',
                fontSize: '0.9em',
                color: theme.palette.text.secondary,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
            }}>
                <Box sx={{
                    mr: '4px',
                    display: 'flex',
                    color: theme.palette.warning.main
                }}><KeyVariant height={14}/></Box>
                {truncateMiddle(pub, 24, ':')}
            </Box>
        </CopyToClipboard>
        {keys?.pub !== pubkey && (
            <TextField
                autoComplete="off"
                InputProps={{
                    sx: {fontSize: '1em'}
                }} size="small"
                fullWidth
                placeholder={t('Send direct message')}
                value={message}
                onChange={(e) => {
                    setMessage(e.target.value);
                }}
                onKeyUp={(e) => {
                    if (e.key === 'Enter' && message.trim() !== '') {
                        raven?.sendDirectMessage(pubkey, message).then(() => {
                            setMessage('');
                            onDM();
                        });
                    }
                }}
            />
        )}
    </Box>;
}

export default ProfileCard;
