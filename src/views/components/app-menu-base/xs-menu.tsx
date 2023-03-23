import React from 'react';
import {useAtom} from 'jotai';
import Box from '@mui/material/Box';
import {lighten} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {appMenuAtom} from 'store';
import ChevronDoubleRight from 'svg/chevron-double-right';
import ChevronDoubleLeft from 'svg/chevron-double-left';

const XsMenu = (props: { icon: 'open' | 'close' }) => {
    const [appMenu, setAppMenu] = useAtom(appMenuAtom);
    const theme = useTheme();

    return <Box sx={{
        width: '26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: lighten(theme.palette.background.paper, 0.1)
    }} onClick={(e) => {
        e.preventDefault();
        setAppMenu(!appMenu);
    }}>
        {props.icon === 'open' ? <ChevronDoubleRight width={20}/> : <ChevronDoubleLeft width={20}/>}
    </Box>
}

export default XsMenu;