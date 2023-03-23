import React from 'react';
import {useAtom} from 'jotai';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';

import CloseModal from 'components/close-modal';
import MetadataForm from 'views/components/metadata-form';
import useModal from 'hooks/use-modal';
import useTranslation from 'hooks/use-translation';
import {ravenAtom} from 'store';
import {Channel} from 'types';

const EditChannel = (props: { channel: Channel, onSuccess: () => void }) => {
    const {channel, onSuccess} = props;
    const [, showModal] = useModal();
    const [t] = useTranslation();
    const [raven] = useAtom(ravenAtom);

    const handleClose = () => {
        showModal(null);
    };

    if (!channel) {
        return null;
    }

    return (
        <>
            <DialogTitle>{t('Edit Channel')}<CloseModal onClick={handleClose}/></DialogTitle>
            <DialogContent>
                <Box sx={{pt: '6px'}}>
                    <MetadataForm values={{
                        name: channel.name,
                        about: channel.about,
                        picture: channel.picture
                    }} labels={{
                        name: 'Channel name',
                        about: 'Description',
                        picture: 'Channel picture'
                    }} submitBtnLabel='Update' skipButton={<span/>} onSubmit={(data) => {
                        raven?.updateChannel(channel, data);
                        onSuccess();
                    }}/>
                </Box>
            </DialogContent>
        </>
    );
}

export default EditChannel;
