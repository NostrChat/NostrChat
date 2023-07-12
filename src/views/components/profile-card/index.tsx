import React, {useEffect, useMemo, useState} from 'react';
import {useAtom} from 'jotai';
import {nip05, nip19} from 'nostr-tools';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import {useTheme} from '@mui/material/styles';
import CopyToClipboard from 'components/copy-clipboard';
import DmInput from 'views/components/dm-input';
import Avatar from 'views/components/avatar';
import useTranslation from 'hooks/use-translation';
import useStyles from 'hooks/use-styles';
import KeyVariant from 'svg/key-variant';
import {Profile} from 'types';
import {keysAtom} from 'atoms';
import CheckDecagram from 'svg/check-decagram';
import {truncate} from 'util/truncate';

const ProfileCard = (props: { profile: Profile, pub: string, onDM: () => void }) => {
    const {profile, pub, onDM} = props;
    const theme = useTheme();
    const [t] = useTranslation();
    const [keys] = useAtom(keysAtom);
    const styles = useStyles();
    const [nip05Verified, setNip05Verified] = useState<boolean>(false);

    const npub = useMemo(() => nip19.npubEncode(pub), [pub]);
    const isMe = keys?.pub === pub;

    useEffect(() => {
        if (!profile?.nip05) return;
        nip05.queryProfile(profile.nip05).then((resp) => {
            setNip05Verified(resp?.pubkey === profile.creator);
        })
    }, [profile]);

    return <Paper sx={{textAlign: 'center', p: '20px'}}>
        <Box sx={{mb: '10px'}}>
            <Avatar src={profile?.picture} seed={pub} size={140} rounded/>
        </Box>
        {(profile.name || nip05Verified) && (<Box sx={{
            fontFamily: 'Faktum, sans-serif',
            fontSize: '1.1em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {profile.name ? truncate(profile.name, 60) : ''}
            {nip05Verified && (<Tooltip title={t('NIP-05 verified')}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        ml: '6px'
                    }}>
                        <CheckDecagram height={18}/>
                    </Box>
                </Tooltip>
            )}
        </Box>)}
        {profile.about && (
            <>
                <Divider sx={{m: '12px 0'}}/>
                <Box sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '0.9em',
                }}>{truncate(profile.about, 360)}</Box>
            </>
        )}
        <CopyToClipboard copy={pub}>
            <Box sx={{
                m: '16px 0',
                fontSize: '0.9em',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                minWidth: '0'
            }}>
                <Box sx={{
                    mr: '4px',
                    display: 'flex',
                    color: theme.palette.warning.main
                }}><KeyVariant height={14}/></Box>
                <Box sx={{
                    color: theme.palette.primary.dark,
                    fontSize: '0.9em',
                    ...styles.ellipsis
                }}>{npub}</Box>
            </Box>
        </CopyToClipboard>
        {(() => {
            if (isMe) return null;
            if (!keys) return <Button variant="contained" size="small" onClick={onDM}>{t('Login to send DM')}</Button>;
            return <DmInput pubkey={pub} onDM={onDM}/>;
        })()}
    </Paper>
}

export default ProfileCard;
