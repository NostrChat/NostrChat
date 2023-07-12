import React from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import {useAtom} from 'jotai';

import CloseModal from 'components/close-modal';
import useModal from 'hooks/use-modal';
import useToast from 'hooks/use-toast';
import useTranslation from 'hooks/use-translation';
import MetadataForm from 'views/components/metadata-form';
import {ravenAtom} from 'atoms';

const CreateChannel = (props: { onSuccess: (id: string) => void }) => {
    const {onSuccess} = props;
    const [, showModal] = useModal();
    const [, showMessage] = useToast();
    const [t] = useTranslation();
    const [raven] = useAtom(ravenAtom);

    const handleClose = () => {
        showModal(null);
    };

    return (
        <>
            <DialogTitle>{t('Create Channel')}<CloseModal onClick={handleClose}/></DialogTitle>
            <DialogContent>
                <Box sx={{pt: '6px'}}>
                    <MetadataForm submitBtnLabel='Submit' skipButton={<span/>} labels={{
                        name: 'Channel name',
                        about: 'Description',
                        picture: 'Channel picture'
                    }} onSubmit={(data) => {
                        raven?.createChannel(data).then((ev) => {
                            onSuccess(ev.id);
                        }).catch((e) => {
                            showMessage(e.toString(), 'error');
                        });
                    }}/>
                </Box>
            </DialogContent>
        </>
    );
}

export default CreateChannel;
