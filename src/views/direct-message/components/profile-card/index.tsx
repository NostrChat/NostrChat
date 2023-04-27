import React, {useMemo} from 'react';
import {useAtom} from 'jotai';
import {nip19} from 'nostr-tools';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import {useTheme} from '@mui/material/styles';
import CopyToClipboard from 'components/copy-clipboard';
import DmInput from 'views/components/dm-input';
import useTranslation from 'hooks/use-translation';
import useStyles from 'hooks/use-styles';
import KeyVariant from 'svg/key-variant';
import {Profile} from 'types';
import {keysAtom} from 'store';
import {truncate} from 'util/truncate';

const ProfileCard = (props: { profile: Profile, pub: string, onDM: () => void }) => {
    const {profile, pub, onDM} = props;
    const theme = useTheme();
    const [t] = useTranslation();
    const [keys] = useAtom(keysAtom);
    const styles = useStyles();

    const npub = useMemo(() => nip19.npubEncode(pub), [pub]);
    const hasPicture = profile.picture.startsWith('https://');
    const isMe = keys?.pub === pub;

    return <Paper sx={{textAlign: 'center', p: '20px'}}>
        {hasPicture && (
            <>
                <Box sx={{mb: '10px'}}>
                    <Box component="img" sx={{
                        width: '140px',
                        height: '140px',
                        borderRadius: theme.shape.borderRadius
                    }} src={profile.picture} alt={profile.name}/>
                </Box>
            </>
        )}
        {profile.name && (<Box sx={{
            fontFamily: 'Faktum, sans-serif',
            fontSize: '1.1em',
        }}>{truncate(profile.name, 60)}</Box>)}
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
            if (!keys) return <Button variant="contained" onClick={onDM}>{t('Login to send DM')}</Button>;
            return <DmInput pubkey={pub} onDM={onDM}/>;
        })()}
    </Paper>
}

export default ProfileCard;
