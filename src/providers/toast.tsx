import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Slide, {SlideProps} from '@mui/material/Slide';

import useToast from '../hooks/use-toast';

const SlideTransition = (props: SlideProps) => {
    return <Slide {...props} direction='down'/>;
}

const ToastProvider = (props: { children: React.ReactNode }) => {
    const [toast, , hideMessage] = useToast();
    return <>
        {props.children}
        {(toast.message && toast.type) && (
            <Snackbar TransitionComponent={SlideTransition} open onClose={hideMessage}
                      anchorOrigin={{vertical: 'top', horizontal: 'right'}}>
                <Alert onClose={hideMessage} variant='filled' severity={toast.type}
                       sx={{width: '100%'}}>{toast.message}</Alert>
            </Snackbar>
        )}
    </>;
}

export default ToastProvider;
