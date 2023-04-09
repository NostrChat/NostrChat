import React, {useEffect} from 'react';
import {useAtom} from 'jotai';
import {useLocation} from '@reach/router';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import {appMenuAtom} from 'store';

const AppMenuBase = (props: { children: React.ReactNode, children2?: React.ReactNode }) => {
    const theme = useTheme();
    const {isMd} = useMediaBreakPoint();
    const [appMenu, setAppMenu] = useAtom(appMenuAtom);
    const location = useLocation();

    useEffect(() => {
        if (appMenu) {
            setAppMenu(false);
        }
    }, [location]);

    const isSmallScreen = !isMd;

    if (isSmallScreen && !appMenu) {
        return null;
    }

    return <Box sx={{
        height: '100%',
        width: '270px',
        p: '0 16px',
        flexShrink: 0,
        flexGrow: 0,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        justifyContent: 'space-between'
    }}>
        <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <Box sx={{
                flexGrow: 1,
                flexShrink: 0,
            }}>
                {props.children}
            </Box>
            {props.children2 && (
                <Box sx={{
                    flexGrow: 0,
                    flexShrink: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '12px'
                }}>
                    {props.children2}
                </Box>
            )}
        </Box>
    </Box>
}

export default AppMenuBase;
