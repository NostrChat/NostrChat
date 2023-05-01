import React, {useState} from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {nip19} from 'nostr-tools';

import CloseModal from 'components/close-modal';
import useModal from 'hooks/use-modal';
import useTranslation from 'hooks/use-translation';


const StartDM = (props: { onSuccess: (npub: string) => void }) => {
    const {onSuccess} = props;
    const [, showModal] = useModal();
    const [t] = useTranslation();
    const [npub, setNpub] = useState('');
    const [error, setError] = useState('');

    const handleClose = () => {
        showModal(null);
    };

    const idChanged = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setNpub(e.target.value);
    };

    const submit = () => {
        setError('');
        let decoded;
        try {
            decoded = nip19.decode(npub)
        } catch (_) {
            setError(t('Invalid npub'));
            return;
        }

        if (decoded.type !== 'npub') {
            setError(t('Invalid npub'));
            return;
        }

        onSuccess(npub);
    }

    return (
        <>
            <DialogTitle>{t('Direct Message')}<CloseModal onClick={handleClose}/></DialogTitle>
            <DialogContent>
                <Box sx={{pt: '6px'}}>
                    <TextField label={t('npub')} value={npub} onChange={idChanged} fullWidth autoFocus
                               error={!!error} helperText={error || ' '}/>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                        <Button variant="contained" onClick={submit}>{t('Go')}</Button>
                    </Box>
                </Box>
            </DialogContent>
        </>
    );
}

export default StartDM;
