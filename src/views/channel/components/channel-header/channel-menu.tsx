import React, {useState} from 'react';
import {useAtom} from 'jotai';
import {useNavigate} from '@reach/router';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import useTranslation from 'hooks/use-translation';
import useModal from 'hooks/use-modal';
import useLiveChannel from 'hooks/use-live-channel';
import EditChannel from 'views/components/dialogs/edit-channel';
import ConfirmDialog from 'components/confirm-dialog';
import {ravenAtom} from 'store';
import DotsVertical from 'svg/dots-vertical';

const ChannelMenu = () => {
    const channel = useLiveChannel();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [t] = useTranslation();
    const [, showModal] = useModal();
    const [raven] = useAtom(ravenAtom);
    const navigate = useNavigate();

    if (!channel) {
        return null;
    }

    const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const closeMenu = () => {
        setAnchorEl(null);
    };

    const edit = () => {
        showModal({
            body: <EditChannel channel={channel} onSuccess={() => {
                showModal(null);
            }}/>
        })

        closeMenu();
    }

    const del = () => {
        showModal({
            body: <ConfirmDialog onConfirm={() => {
                raven?.deleteEvents([channel!.id], '');
                navigate('/channel').then();
            }}/>
        });
        closeMenu();
    }

    return <>
        <IconButton size="small" onClick={openMenu}>
            <DotsVertical height={24}/>
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={closeMenu}>
            <MenuItem dense onClick={edit}>{t('Edit')}</MenuItem>
            <MenuItem dense onClick={del}>{t('Delete')}</MenuItem>
        </Menu>
    </>
}

export default ChannelMenu;
