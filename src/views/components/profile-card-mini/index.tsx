import {useAtom} from 'jotai';
import React, {useMemo} from 'react';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import {nip19} from 'nostr-tools';
import useTranslation from 'hooks/use-translation';
import CopyToClipboard from 'components/copy-clipboard';
import Avatar from 'views/components/avatar';
import MuteBtn from 'views/components/mute-btn';
import DmInput from 'views/components/dm-input';
import {keysAtom} from 'store';
import {Profile} from 'types';
import KeyVariant from 'svg/key-variant';
import EyeOff from 'svg/eye-off';
import {truncate, truncateMiddle} from 'util/truncate';

const ProfileCardMini = (props: { profile?: Profile, pubkey: string, onDM: () => void }) => {
    const {profile, pubkey, onDM} = props;
    const [keys] = useAtom(keysAtom);
    const theme = useTheme();
    const [t] = useTranslation();

    const profileName = useMemo(() => profile?.name ? truncateMiddle(profile.name, 24, ':') : null, [profile]);
    const pub = useMemo(() => nip19.npubEncode(pubkey), [pubkey]);
    const isMe = keys?.pub === pubkey;

    return <Box sx={{fontSize: '0.8em'}}>
        <Box sx={{
            mb: '10px',
            display: 'flex',
            position: 'relative',
            height: '200px',
        }}>
            {!isMe && (<Box sx={{
                position: 'absolute',
                right: '4px',
                top: '4px',
                zIndex: 2,
                padding: '3px',
                borderRadius: theme.shape.borderRadius,
                background: theme.palette.background.paper
            }}>
                <Tooltip title={t('Mute')}>
                    <Box>
                        <MuteBtn pubkey={pubkey}>
                            <IconButton><EyeOff height={14}/></IconButton>
                        </MuteBtn>
                    </Box>
                </Tooltip>
            </Box>)}
            <Box sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: 1
            }}>
                <Avatar src={profile?.picture} seed={pubkey} size={200}/>
            </Box>
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
        {!isMe && (<DmInput pubkey={pubkey} onDM={onDM}/>)}
    </Box>;
}

export default ProfileCardMini;