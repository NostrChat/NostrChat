import React, {useEffect} from 'react';
import {useAtom} from 'jotai';
import {useLocation} from '@reach/router';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import XsMenu from 'views/components/app-menu-base/xs-menu';
import {appMenuAtom} from 'store';

const AppMenuBase = (props: { children: React.ReactNode, children2?: React.ReactNode }) => {
    const theme = useTheme();
    const [, isMd] = useMediaBreakPoint();
    const [appMenu, setAppMenu] = useAtom(appMenuAtom);
    const location = useLocation();

    useEffect(() => {
        if (appMenu) {
            setAppMenu(false);
        }
    }, [location]);

    if (!isMd && !appMenu) {
        return <XsMenu icon='open'/>;
    }

    return <Box sx={{
        height: '100%',
        width: isMd ? '270px' : '100%',
        p: `0 ${!isMd && appMenu ? '0' : '16px'} 0 16px`,
        flexShrink: 0,
        flexGrow: 0,
        borderRight: isMd ? `1px solid ${theme.palette.divider}` : null,
        display: 'flex',
        justifyContent: 'space-between'
    }}>
        <Box sx={{
            width: !isMd ? 'calc(100% - 40px)' : '100%',
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
        {!isMd && appMenu && <XsMenu icon='close'/>}
    </Box>
}

export default AppMenuBase;
