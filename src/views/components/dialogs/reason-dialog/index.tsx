import React, {useState} from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import CloseModal from 'components/close-modal';
import useModal from 'hooks/use-modal';
import useTranslation from 'hooks/use-translation';


const ReasonDialog = (props: { title: string, onConfirm: (reason: string) => void }) => {
    const {title, onConfirm} = props;
    const [, showModal] = useModal();
    const [t] = useTranslation();
    const [reason, setReason] = useState('');
    const handleClose = () => {
        showModal(null);
    };
    const reasonChanged = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setReason(e.target.value);
    };
    const hide = () => {
        handleClose();
        onConfirm(reason);
    }

    return (
        <>
            <DialogTitle>{title}<CloseModal onClick={handleClose}/></DialogTitle>
            <DialogContent>
                <Box sx={{pt: '6px'}}>
                    <TextField label={t('Reason')} value={reason} onChange={reasonChanged} fullWidth autoFocus
                              helperText={'optional'}/>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                        <Button variant="contained" onClick={hide}>Hide</Button>
                    </Box>
                </Box>
            </DialogContent>
        </>
    );
}

export default ReasonDialog;
