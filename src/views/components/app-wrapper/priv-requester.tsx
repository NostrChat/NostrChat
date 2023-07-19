import React, {useEffect, useMemo, useState} from 'react';
import {useAtom} from 'jotai';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import {DialogContentText, TextField} from '@mui/material';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import {nip19} from 'nostr-tools';
import {DecodeResult} from 'nostr-tools/lib/nip19';
import CloseModal from 'components/close-modal';
import useModal from 'hooks/use-modal';
import useTranslation from 'hooks/use-translation';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import {tempPrivAtom} from 'atoms';


window.requestPrivateKey = (data: any) => {
    return new Promise((resolve, reject) => {
        window.dispatchEvent(new CustomEvent('request-priv', {detail: {data}}));

        const handleResolve = (ev: CustomEvent) => {
            window.removeEventListener('resolve-priv', handleResolve as EventListener);
            window.removeEventListener('reject-priv', handleReject);
            resolve(ev.detail.key);
        }

        const handleReject = () => {
            reject('Cancelled');
            window.removeEventListener('resolve-priv', handleResolve as EventListener);
            window.removeEventListener('reject-priv', handleReject);
        }

        window.addEventListener('resolve-priv', handleResolve as EventListener);
        window.addEventListener('reject-priv', handleReject);
    })
}

const PrivRequiredDialog = (props: { data: any, onSuccess: (key: string) => void, onHide: () => void }) => {
    const {data, onSuccess, onHide} = props;
    const [, showModal] = useModal();
    const [t] = useTranslation();
    const theme = useTheme();
    const {isSm} = useMediaBreakPoint();
    const [tempPriv, setTempPriv] = useAtom(tempPrivAtom);
    const [userKey, setUserKey] = useState(tempPriv);
    const [isInvalid, setIsInvalid] = useState(false);
    const [remember, setRemember] = useState(tempPriv !== '');

    const isEvent = data.id !== undefined && data.sig !== undefined;
    const dataToRender = useMemo(() => {
        if (isEvent) {
            const {id: _, sig: __, ...ev} = data;
            return JSON.stringify(ev, null, 2);
        } else {
            return JSON.stringify(data, null, 2);
        }
    }, [data]);

    const handleClose = () => {
        showModal(null);
        onHide();
    };

    const handleUserKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserKey(e.target.value);
        setIsInvalid(false);
    }

    const handleRememberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRemember(e.target.checked);
    }

    const handleSubmit = () => {
        if (!userKey.startsWith('nsec')) {
            setIsInvalid(true);
            return;
        }

        if (userKey.startsWith('nsec')) {
            let dec: DecodeResult;
            try {
                dec = nip19.decode(userKey);
            } catch (e) {
                setIsInvalid(true);
                return;
            }

            const key = dec.data as string;
            if (dec.type === 'nsec') {
                onSuccess(key);
                setTempPriv(remember ? userKey : '');
            } else {
                setIsInvalid(true);
            }
        }
    }

    return (
        <>
            <DialogTitle>{t('Private key required')}<CloseModal onClick={handleClose}/></DialogTitle>
            <DialogContent sx={{pb: '0'}}>
                <DialogContentText sx={{fontSize: '.8em', mb: '12px'}}>
                    {isEvent ? t('Please enter your private key in nsec format to sign this event.') : t('Please enter your private key in nsec format to encrypt this message.')}
                    <br/>
                    <Box component="span" sx={{
                        background: theme.palette.divider,
                        fontSize: '.8em'
                    }}>{t('The key you enter will be kept in only browser/app memory.')}</Box>
                </DialogContentText>
                <Box component="pre" sx={{
                    fontSize: '.6em',
                    overflowY: 'auto',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '6px',
                    p: '2px',
                    color: theme.palette.text.secondary
                }}>{dataToRender}</Box>
                <TextField fullWidth autoComplete="off" autoFocus={userKey === ''}
                           value={userKey} onChange={handleUserKeyChange}
                           placeholder={t('Enter nsec')}
                           error={isInvalid}
                           helperText={isInvalid ? t('Invalid key') : ''}
                           inputProps={{
                               autoCorrect: 'off',
                           }}
                           onKeyPress={(e) => {
                               if (e.key === 'Enter') {
                                   handleSubmit()
                               }
                           }}/>
            </DialogContent>
            <DialogActions sx={{
                display: 'flex',
                flexDirection: isSm ? 'row' : 'column',
                justifyContent: 'space-between',
                pl: isSm ? '24px' : null,
                pr: isSm ? '24px' : null,
                mt: isSm ? '10px' : null
            }}>
                <Box sx={{
                    fontSize: '.7em',
                    color: theme.palette.text.secondary,
                    m: isSm ? null : '12px 0'
                }}>
                    <Box component="label" sx={{
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <Box component="input" type="checkbox" checked={remember} onChange={handleRememberChange}/>
                        {t('Remember for this session')}</Box>
                </Box>
                <Box>
                    <Button onClick={handleClose} sx={{mr: '6px'}}>{t('Skip')}</Button>
                    <Button variant="contained" onClick={handleSubmit} disableElevation>{t('Submit')}</Button>
                </Box>
            </DialogActions>
        </>
    );
}

const PrivRequester = () => {
    const [, showModal] = useModal();

    const rejected = () => {
        window.dispatchEvent(new Event('reject-priv'));
        showModal(null);
    }

    const handleRequest = (ev: CustomEvent) => {
        setTimeout(() => { // use a timer to solve modal rendering conflicts.
            showModal({
                body: <PrivRequiredDialog data={ev.detail.data} onSuccess={(key) => {
                    window.dispatchEvent(new CustomEvent('resolve-priv', {detail: {key}}));
                    showModal(null);
                }} onHide={rejected}/>,
                onHide: rejected,
                hideOnBackdrop: true
            });
        }, 200);
    }

    useEffect(() => {
        window.addEventListener('request-priv', handleRequest as EventListener);

        return () => {
            window.removeEventListener('request-priv', handleRequest as EventListener);
        }
    }, []);

    return null;
}


export default PrivRequester;