import React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import CloseModal from 'components/close-modal';
import Login from 'views/components/login';
import useModal from 'hooks/use-modal';

const LoginDialog = (props: { onLogin: () => void }) => {
    const {onLogin} = props;
    const [, showModal] = useModal();

    const handleClose = () => showModal(null);

    return (
        <>
            <DialogTitle><CloseModal onClick={handleClose}/></DialogTitle>
            <DialogContent>
                <Login onLogin={onLogin}/>
            </DialogContent>
        </>
    );
}

export default LoginDialog;
