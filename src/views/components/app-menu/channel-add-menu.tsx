import React, {useState} from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import {useNavigate} from '@reach/router';

import CreateChannel from 'views/components/dialogs/create-channel';
import JoinChannel from 'views/components/dialogs/join-channel';
import useTranslation from 'hooks/use-translation';
import useModal from 'hooks/use-modal';
import Plus from 'svg/plus';

const ChannelAddMenu = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const open = Boolean(anchorEl);
    const [t] = useTranslation();
    const [, showModal] = useModal();

    const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const closeMenu = () => {
        setAnchorEl(null);
    };

    const create = () => {
        showModal({
            body: <CreateChannel onSuccess={() => {
                showModal(null);
            }}/>
        })

        closeMenu();
    }

    const join = () => {
        showModal({
            body: <JoinChannel onSuccess={(id) => {
                showModal(null);
                navigate(`/channel/${id}`).then();
            }}/>
        })

        closeMenu();
    }

    return <>
        <Button onClick={openMenu} sx={{minWidth: 'auto'}}><Plus height={18}/></Button>
        <Menu anchorEl={anchorEl} open={open} onClose={closeMenu}>
            <MenuItem dense onClick={create}>{t('Create')}</MenuItem>
            <MenuItem dense onClick={join}>{t('Join')}</MenuItem>
        </Menu>
    </>
}

export default ChannelAddMenu;
