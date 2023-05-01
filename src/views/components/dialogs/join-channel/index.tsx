import React, {useState} from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import CloseModal from 'components/close-modal';
import useModal from 'hooks/use-modal';
import useTranslation from 'hooks/use-translation';
import {isSha256} from 'util/crypto';


const JoinChannel = (props: { onSuccess: (id: string) => void }) => {
    const {onSuccess} = props;
    const [, showModal] = useModal();
    const [t] = useTranslation();
    const [id, setID] = useState('');
    const [error, setError] = useState('');

    const handleClose = () => {
        showModal(null);
    };

    const idChanged = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setID(e.target.value);
    };

    const submit = () => {
        setError('');
        if (!isSha256(id)) {
            setError(t('Invalid id'));
            return;
        }
        onSuccess(id);
    }

    return (
        <>
            <DialogTitle>{t('Join a Channel')}<CloseModal onClick={handleClose}/></DialogTitle>
            <DialogContent>
                <Box sx={{pt: '6px'}}>
                    <TextField label={t('Channel id')} value={id} onChange={idChanged} fullWidth autoFocus
                               error={!!error} helperText={error || ' '}/>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                        <Button variant="contained" onClick={submit}>{t('Go')}</Button>
                    </Box>
                </Box>
            </DialogContent>
        </>
    );
}

export default JoinChannel;
