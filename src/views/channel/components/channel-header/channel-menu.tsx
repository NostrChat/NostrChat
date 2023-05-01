import React, {Fragment, useMemo, useState} from 'react';
import {useAtom} from 'jotai';
import {useNavigate} from '@reach/router';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import useTranslation from 'hooks/use-translation';
import useModal from 'hooks/use-modal';
import useToast from 'hooks/use-toast';
import useLiveChannel from 'hooks/use-live-channel';
import EditChannel from 'views/channel/components/dialogs/edit-channel';
import Invite from 'views/channel/components/dialogs/invite';
import ConfirmDialog from 'components/confirm-dialog';
import {keysAtom, ravenAtom} from 'store';
import DotsVertical from 'svg/dots-vertical';
import {GLOBAL_CHAT} from 'const';

const ChannelMenu = () => {
    const channel = useLiveChannel();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [t] = useTranslation();
    const [, showModal] = useModal();
    const [, showMessage] = useToast();
    const [raven] = useAtom(ravenAtom);
    const [keys] = useAtom(keysAtom);
    const navigate = useNavigate();

    const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const closeMenu = () => {
        setAnchorEl(null);
    };

    const edit = () => {
        if (!channel) return;
        showModal({
            body: <EditChannel channel={channel} onSuccess={() => {
                showModal(null);
            }}/>
        });
        closeMenu();
    }

    const del = () => {
        if (!channel) return;
        showModal({
            body: <ConfirmDialog onConfirm={() => {
                raven?.deleteEvents([channel.id], '').then(() => {
                    navigate('/channel').then();
                }).catch((e) => {
                    showMessage(e.toString(), 'error');
                });
            }}/>
        });
        closeMenu();
    }

    const invite = () => {
        if (!channel) return;
        showModal({
            body: <Invite channel={channel}/>
        });
        closeMenu();
    }

    const menuItems = useMemo(() => {
        const canEdit = keys?.pub === channel?.creator && channel?.id !== GLOBAL_CHAT.id;

        const items: React.ReactElement[] = [];

        if (canEdit) {
            items.push(<MenuItem key={1} dense onClick={edit}>{t('Edit')}</MenuItem>);
            items.push(<MenuItem key={2} dense onClick={del}>{t('Delete')}</MenuItem>);
        }

        items.push(<MenuItem key={3} dense onClick={invite}>{t('Invite')}</MenuItem>);

        return items;
    }, [keys, channel]);

    if (!channel) return null;

    return <>
        <IconButton size="small" onClick={openMenu}>
            <DotsVertical height={24}/>
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={closeMenu}>{menuItems}</Menu>
    </>
}

export default ChannelMenu;
