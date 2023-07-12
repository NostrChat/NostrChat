import {useAtom} from 'jotai';
import React, {useEffect, useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DialogContent from '@mui/material/DialogContent';
import {nip05, nip19} from 'nostr-tools';
import useTranslation from 'hooks/use-translation';
import useModal from 'hooks/use-modal';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import CloseModal from 'components/close-modal';
import CopyToClipboard from 'components/copy-clipboard';
import Avatar from 'views/components/avatar';
import MuteBtn from 'views/components/mute-btn';
import DmInput from 'views/components/dm-input';
import {keysAtom} from 'atoms';
import {Profile} from 'types';
import KeyVariant from 'svg/key-variant';
import EyeOff from 'svg/eye-off';
import CheckDecagram from 'svg/check-decagram';
import {truncate, truncateMiddle} from 'util/truncate';


const ProfileDialog = (props: { profile?: Profile, pubkey: string, onDM: () => void }) => {
    const {profile, pubkey, onDM} = props;
    const [keys] = useAtom(keysAtom);
    const theme = useTheme();
    const [t] = useTranslation();
    const [, showModal] = useModal();
    const {isSm} = useMediaBreakPoint();
    const [nip05Verified, setNip05Verified] = useState<boolean>(false);

    const profileName = useMemo(() => profile?.name ? truncateMiddle(profile.name, 24, ':') : null, [profile]);
    const pub = useMemo(() => nip19.npubEncode(pubkey), [pubkey]);
    const isMe = keys?.pub === pubkey;

    const boxSx = {
        position: 'absolute',
        top: '4px',
        zIndex: 2,
        padding: '3px',
        borderRadius: theme.shape.borderRadius,
        background: theme.palette.background.paper,
        width: '36px',
        height: '36px',
    };

    useEffect(() => {
        if (!profile?.nip05) return;
        nip05.queryProfile(profile.nip05).then((resp) => {
            setNip05Verified(resp?.pubkey === profile.creator);
        })
    }, [profile]);

    const handleClose = () => {
        showModal(null);
    };

    return <>
        <DialogContent>
            <CloseModal onClick={handleClose}/>
            <Box sx={{fontSize: '0.8em'}}>
                <Box sx={{
                    mb: '10px',
                    display: 'flex',
                    position: 'relative',
                    height: '200px',
                    width: '200px',
                    margin: 'auto'
                }}>
                    {nip05Verified && (
                        <Box sx={{...boxSx, left: '4px'}}>
                            <Tooltip title={t('NIP-05 verified')}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                }}>
                                    <CheckDecagram height={18}/>
                                </Box>
                            </Tooltip>
                        </Box>
                    )}
                    {!isMe && (<Box sx={{...boxSx, right: '4px'}}>
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
                <Box sx={{textAlign: 'center', mt: '12px'}}>
                    {profileName && (<Box sx={{mb: '10px', fontWeight: 600, fontSize: '1.2em'}}>{profileName}</Box>)}
                    {profile?.about && (
                        <Box sx={{
                            mb: '10px',
                            wordBreak: 'break-word',
                            lineHeight: '1.4em',
                            color: theme.palette.text.secondary
                        }}>{truncate(profile.about, 160)}</Box>
                    )}
                    <CopyToClipboard copy={pub}>
                        <Box sx={{
                            mb: '16px',
                            fontSize: '0.9em',
                            color: theme.palette.text.secondary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}>
                            <Box sx={{
                                mr: '4px',
                                display: 'flex',
                                color: theme.palette.warning.main
                            }}><KeyVariant height={14}/></Box>
                            {truncateMiddle(pub, (isSm ? 46 : 36), ':')}
                        </Box>
                    </CopyToClipboard>
                </Box>
                {!isMe && (<DmInput pubkey={pubkey} onDM={onDM}/>)}
            </Box>
        </DialogContent>
    </>;
}

export default ProfileDialog;