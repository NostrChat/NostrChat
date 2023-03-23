import React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import {DialogContentText} from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

import CloseModal from 'components/close-modal';
import useTranslation from 'hooks/use-translation';
import useModal from 'hooks/use-modal';


export const InstallNip07Dialog = () => {
    const [t] = useTranslation();
    const [, showModal] = useModal();

    const handleClose = () => {
        showModal(null);
    };

    return (
        <>
            <DialogTitle>{t('No NIP-07 wallet found!')}
                <CloseModal onClick={handleClose}/>
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                   <Box component="p"> {t('Please install one of the following wallets to continue.')}</Box>
                    <ul>
                        <li><Link target="_blank" rel="noreferrer"  href="https://github.com/fiatjaf/nos2x">nos2x</Link> <small>(Chrome and derivatives)</small></li>
                        <li><Link target="_blank" rel="noreferrer"  href="https://getalby.com/">Alby</Link> <small>(Chrome and derivatives, Firefox, Safari)</small></li>
                        <li><Link target="_blank" rel="noreferrer"  href="https://www.blockcore.net/wallet">Blockcore</Link> <small>(Chrome and derivatives)</small></li>
                        <li><Link target="_blank" rel="noreferrer"  href="https://diegogurpegui.com/nos2x-fox/">nos2x-fox</Link> <small>(Firefox)</small></li>
                        <li><Link target="_blank" rel="noreferrer"  href="https://www.getflamingo.org/">Flamingo</Link> <small>(Chrome and derivatives)</small></li>
                    </ul>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={handleClose}>{t('Dismiss')}</Button>
            </DialogActions>
        </>
    );
};
