import React, {useEffect, useState} from 'react';
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


window.requestPrivateKey = () => {
    return new Promise((resolve, reject) => {
        window.dispatchEvent(new Event('request-priv'));

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

const PrivRequiredDialog = (props: { onSuccess: (key: string) => void, onHide: () => void }) => {
    const {onSuccess, onHide} = props;
    const [, showModal] = useModal();
    const [t] = useTranslation();
    const [userKey, setUserKey] = useState('');
    const [isInvalid, setIsInvalid] = useState(false);

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

const PrivRequired = () => {
    const [, showModal] = useModal();

    const rejected = () => {
        window.dispatchEvent(new Event('reject-priv'));
        showModal(null);
    }

    const handleRequest = () => {
        showModal({
            body: <PrivRequiredDialog onSuccess={(key) => {
                window.dispatchEvent(new CustomEvent('resolve-priv', {detail: {key}}));
                showModal(null);
            }} onHide={rejected}/>,
            onHide: rejected,
            hideOnBackdrop: true
        });
    }

    useEffect(() => {
        window.addEventListener('request-priv', handleRequest);

        return () => {
            window.removeEventListener('request-priv', handleRequest);
        }
    }, []);

    return null;
}


export default PrivRequired;