import React, {useState} from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import useTranslation from 'hooks/use-translation';
import MuteBtn from 'views/components/mute-btn';
import DotsVertical from 'svg/dots-vertical';

const DMMenu = (props: { pubkey: string }) => {
    const {pubkey} = props;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [t] = useTranslation();

    const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const closeMenu = () => {
        setAnchorEl(null);
    };

    return <>
        <IconButton size="small" onClick={openMenu}>
            <DotsVertical height={24}/>
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={closeMenu}>
            <MuteBtn pubkey={pubkey}><MenuItem dense>{t('Mute')}</MenuItem></MuteBtn>
        </Menu>
    </>
}

export default DMMenu;
