import React from 'react';
import Dialog from '@mui/material/Dialog';
import {TransitionProps} from '@mui/material/transitions';
import Slide from '@mui/material/Slide';

import useModal from 'hooks/use-modal';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ModalProvider = (props: { children: React.ReactNode }) => {
    const [modal, showModal] = useModal();
    return <>
        {props.children}
        {modal && (
            <Dialog
                open={true}
                TransitionComponent={Transition}
                fullWidth
                fullScreen={modal.fullScreen || false}
                disableEscapeKeyDown={false}
                maxWidth={modal.maxWidth || 'sm'}
                onClose={() => {
                    if (modal?.hideOnBackdrop) {
                        showModal(null);
                    }
                }}
            >
                {modal.body}
            </Dialog>
        )}
    </>;
}

export default ModalProvider;
