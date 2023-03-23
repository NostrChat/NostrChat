import React, {useState} from 'react';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {TextField} from '@mui/material';
import * as secp from '@noble/secp256k1';
import {nip19} from 'nostr-tools';

import CloseModal from 'components/close-modal';
import useModal from 'hooks/use-modal';
import useTranslation from 'hooks/use-translation';

const ImportAccount = (props: { onSuccess: (key: string) => void }) => {
    const {onSuccess} = props;
    const [, showModal] = useModal();
    const [t] = useTranslation();
    const [userKey, setUserKey] = useState('');
    const [isInvalid, setIsInvalid] = useState(false);

    const handleClose = () => {
        showModal(null);
    };

    const handleSubmit = () => {
        if (userKey.startsWith('nsec')) {
            const dec = nip19.decode(userKey);
            if (dec.type === 'nsec') {
                onSuccess(dec.data as string);
                return;
            }
        }

        if (!secp.utils.isValidPrivateKey(userKey)) {
            setIsInvalid(true);
        } else {
            setIsInvalid(false);
            onSuccess(userKey);
        }
    }

    const handleUserKeyChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setUserKey(e.target.value);
        setIsInvalid(false);
    }

    return (
        <>
            <DialogTitle>{t('Import Account')}<CloseModal onClick={handleClose}/></DialogTitle>
            <DialogContent sx={{pb: '0'}}>
                <TextField fullWidth autoComplete="off" autoFocus
                           value={userKey} onChange={handleUserKeyChange}
                           placeholder={t('Enter account private key')}
                           error={isInvalid}
                           helperText={isInvalid ? t('Invalid private key') : ' '}
                           inputProps={{
                               autoCorrect: 'off',
                           }}
                           onKeyPress={(e) => {
                               if (e.key === 'Enter') {
                                   handleSubmit()
                               }
                           }}/>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={handleSubmit} disableElevation>{t('Submit')}</Button>
            </DialogActions>
        </>
    );
}

export default ImportAccount;
