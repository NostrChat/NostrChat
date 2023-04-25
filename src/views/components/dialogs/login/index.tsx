import React from 'react';
import DialogTitle from '@mui/material/DialogTitle';

import DialogContent from '@mui/material/DialogContent';
import CloseModal from 'components/close-modal';
import Login from 'views/components/login';
import useModal from 'hooks/use-modal';
import useTranslation from 'hooks/use-translation';

const LoginDialog = (props: { onLogin: () => void }) => {
    const {onLogin} = props;
    const [, showModal] = useModal();
    const [t] = useTranslation();

    const handleClose = () => {
        showModal(null);
    };

    return (
        <>
            <DialogTitle><CloseModal onClick={handleClose}/></DialogTitle>
            <DialogContent sx={{pb: '0'}}>
                <Login onLogin={onLogin}/>
            </DialogContent>
        </>
    );
}

export default LoginDialog;
