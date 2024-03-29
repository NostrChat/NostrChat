import React, {useEffect, useMemo, useState} from 'react';
import {useAtom} from 'jotai';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import {DialogContentText, TextField} from '@mui/material';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import {getPublicKey, nip19} from 'nostr-tools';
import {DecodeResult} from 'nostr-tools/lib/nip19';
import CloseModal from 'components/close-modal';
import useModal from 'hooks/use-modal';
import useTranslation from 'hooks/use-translation';
import {keysAtom, tempPrivAtom} from 'atoms';


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
    const [keys,] = useAtom(keysAtom);
    const [tempPriv, setTempPriv] = useAtom(tempPrivAtom);
    const [userKey, setUserKey] = useState(tempPriv ? nip19.nsecEncode(tempPriv) : '');
    const [isInvalid, setIsInvalid] = useState(false);

    const isObject = typeof data === 'object';
    const isEvent = isObject && data.id !== undefined && data.sig !== undefined;
    const dataToRender = useMemo(() => {
        if (isEvent) {
            const {id: _, sig: __, ...ev} = data;
            return JSON.stringify(ev, null, 2);
        } else if (isObject) {
            return JSON.stringify(data, null, 2);
        }

        return null;
    }, [data]);

    const handleClose = () => {
        showModal(null);
        onHide();
    };

    const handleUserKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            if (dec.type === 'nsec' && keys?.pub === getPublicKey(key)) {
                onSuccess(key);
                setTempPriv(key);
                return;
            }

            setIsInvalid(true);
        }
    }

    let subTitle;
    if (isEvent) {
        subTitle = t('Please provide your private key in nsec format to sign this event:');
    } else if (isObject) {
        subTitle = t('Please provide your private key in nsec format to encrypt this message:');
    } else {
        subTitle = t('Please provide your private key in nsec format for decryption');
    }

    return (
        <>
            <DialogTitle>{t('Private key required')}<CloseModal onClick={handleClose}/></DialogTitle>
            <DialogContent sx={{pb: '0'}}>
                <DialogContentText sx={{fontSize: '.8em', mb: '12px'}}>{subTitle}</DialogContentText>
                {dataToRender && (
                    <Box component="pre" sx={{
                        fontSize: '.6em',
                        overflowY: 'auto',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '6px',
                        p: '2px',
                        color: theme.palette.text.secondary
                    }}>{dataToRender}</Box>
                )}
                <TextField fullWidth autoComplete="off" autoFocus={userKey === ''}
                           value={userKey} onChange={handleUserKeyChange}
                           placeholder={t('Enter nsec')}
                           error={isInvalid}
                           helperText={isInvalid ? t('Invalid key') : <Box component="span" sx={{
                               background: theme.palette.divider,
                               fontSize: '.9em'
                           }}>{t('This will stay in memory and be remembered until you refresh page/app.')} </Box>}
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
                justifyContent: 'space-between',
                mt: '10px'
            }}>
                <Button onClick={handleClose} sx={{mr: '6px'}}>{t('Skip')}</Button>
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