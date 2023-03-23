import React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import {DialogContentText} from '@mui/material';
import Box from '@mui/material/Box';

import useTranslation from 'hooks/use-translation';
import useModal from 'hooks/use-modal';
import CloseModal from 'components/close-modal';
import CopyToClipboard from 'components/copy-clipboard';
import {truncate} from 'util/truncate';

const ExternalLinkDialog = (props: { link: string }) => {
    const [t] = useTranslation();
    const [, showModal] = useModal();

    const handleClose = () => {
        showModal(null);
    };

    const handleConfirm = () => {
        window.open(props.link, '_blank');
        showModal(null);
    }

    return (
        <>
            <DialogTitle>{t('External Link')}
                <CloseModal onClick={handleClose}/>
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Box sx={{mb: '12px'}}> {t('You are about to open the following external link:')}</Box>
                    <CopyToClipboard copy={props.link}>
                        <Box component="code" sx={{wordBreak: 'break-word', fontSize: '0.7em'}}>
                            {truncate(props.link, 500)}
                        </Box>
                    </CopyToClipboard>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>{t('Cancel')}</Button>
                <Button variant="contained" onClick={handleConfirm}>{t('Open')}</Button>
            </DialogActions>
        </>
    );
}

export default ExternalLinkDialog;
