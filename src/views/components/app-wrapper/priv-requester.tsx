import React, {useEffect, useMemo, useState} from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import {DialogContentText, TextField} from '@mui/material';
import Button from '@mui/material/Button';
import {nip19} from 'nostr-tools';
import {DecodeResult} from 'nostr-tools/lib/nip19';
import CloseModal from 'components/close-modal';
import useModal from 'hooks/use-modal';
import useTranslation from 'hooks/use-translation';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';


window.requestPrivateKey = (event: any) => {
    return new Promise((resolve, reject) => {
        window.dispatchEvent(new CustomEvent('request-priv', {detail: {event}}));

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

const PrivRequiredDialog = (props: { event: any, onSuccess: (key: string) => void, onHide: () => void }) => {
    const {event, onSuccess, onHide} = props;
    const [, showModal] = useModal();
    const [t] = useTranslation();
    const theme = useTheme();
    const [userKey, setUserKey] = useState('');
    const [isInvalid, setIsInvalid] = useState(false);

    const evToRender = useMemo(() => {
        const {id: _, sig: __, ...ev} = event;
        return JSON.stringify(ev, null, 2);
    }, [event])

    const handleClose = () => {
        showModal(null);
        onHide();
    };

    const handleUserKeyChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setUserKey(e.target.value);
        setIsInvalid(false);
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
            } else {
                setIsInvalid(true);
            }
        }
    }

    return (
        <>
            <DialogTitle>{t('Private key required')}<CloseModal onClick={handleClose}/></DialogTitle>
            <DialogContent sx={{pb: '0'}}>
                <DialogContentText sx={{fontSize: '.8em', mb: '18px'}}>
                    {t('Please enter your private key in nsec format to sign this event.')}
                </DialogContentText>
                <Box component="pre" sx={{
                    fontSize: '.6em',
                    overflowY: 'auto',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '6px',
                    p: '2px',
                    color: theme.palette.text.secondary
                }}>
                    {evToRender}
                </Box>
                <TextField fullWidth autoComplete="off" autoFocus
                           value={userKey} onChange={handleUserKeyChange}
                           placeholder={t('Enter nsec')}
                           error={isInvalid}
                           helperText={isInvalid ? t('Invalid key') : ' '}
                           inputProps={{
                               autoCorrect: 'off',
                           }}
                           onKeyPress={(e) => {
                               if (e.key === 'Enter') {
                                   handleSubmit()
                               }
                           }}/>
            </DialogContent>
            <DialogActions sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Button onClick={handleClose}>{t('Cancel')}</Button>
                <Button variant="contained" onClick={handleSubmit} disableElevation>{t('Submit')}</Button>
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
        showModal({
            body: <PrivRequiredDialog event={ev.detail.event} onSuccess={(key) => {
                window.dispatchEvent(new CustomEvent('resolve-priv', {detail: {key}}));
                showModal(null);
            }} onHide={rejected}/>,
            onHide: rejected,
            hideOnBackdrop: true
        });
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