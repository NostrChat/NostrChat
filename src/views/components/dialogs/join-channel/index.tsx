import React, {useState} from 'react';
import {useAtom} from 'jotai';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import CloseModal from 'components/close-modal';
import useModal from 'hooks/use-modal';
import useTranslation from 'hooks/use-translation';
import {commonTsAtom, ravenAtom} from 'store';


const JoinChannel = (props: { onSuccess: () => void }) => {
    const {onSuccess} = props;
    const [, showModal] = useModal();
    const [t] = useTranslation();
    const [id, setID] = useState('');
    const [error, setError] = useState('');
    const [raven] = useAtom(ravenAtom);
    const [, setCommonTs] = useAtom(commonTsAtom);

    const handleClose = () => {
        showModal(null);
    };

    const idChanged = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setID(e.target.value);
    };

    const submit = () => {
        setError('');
        if (!/^[a-f0-9]{64}$/gi.test(id)) {
            setError('Invalid id');
            return;
        }

        setCommonTs(Date.now());
        raven?.loadId(id);
        onSuccess();
    }

    return (
        <>
            <DialogTitle>{t('Join a Channel')}<CloseModal onClick={handleClose}/></DialogTitle>
            <DialogContent>
                <Box sx={{pt: '6px'}}>
                    <TextField label={t('Channel id')} value={id} onChange={idChanged} fullWidth autoFocus
                               error={!!error} helperText={error || ' '}/>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                        <Button variant="contained" onClick={submit}>Join</Button>
                    </Box>
                </Box>
            </DialogContent>
        </>
    );
}

export default JoinChannel;
