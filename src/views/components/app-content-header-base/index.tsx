import React from 'react';
import {useAtom} from 'jotai';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import {useTheme} from '@mui/material/styles';

import useMediaBreakPoint from 'hooks/use-media-break-point';
import {appMenuAtom} from 'store';
import ChevronRight from 'svg/chevron-right';
import ChevronLeft from 'svg/chevron-left';

const AppContentHeaderBase = (props: { children: React.ReactNode }) => {
    const theme = useTheme();
    const [appMenu, setAppMenu] = useAtom(appMenuAtom);
    const {isMd} = useMediaBreakPoint();

    const isSmallScreen = !isMd;

    return <Box>
        <Box sx={{
            height: '88px',
            display: 'flex',
            flexGrow: 0,
            flexShrink: 0,
            borderBottom: `1px solid ${theme.palette.divider}`,
            alignItems: 'center',
            pl: isSmallScreen ? '5px' : '20px'
        }}>
            {isSmallScreen && (
                <Box
                    sx={{
                        width: '40px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: '6px',
                    }}
                    onClick={() => {
                        setAppMenu(!appMenu)
                    }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '12px',
                        width: '36px',
                        height: '36px',
                        background: theme.palette.divider,
                    }}>
                        <IconButton>
                            {appMenu ? <ChevronRight height={24}/> : <ChevronLeft height={24}/>}
                        </IconButton>
                    </Box>
                </Box>
            )}
            {props.children}
        </Box>
    </Box>
}


export default AppContentHeaderBase;
