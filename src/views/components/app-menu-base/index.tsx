import React, {useEffect} from 'react';
import {useAtom} from 'jotai';
import {useLocation} from '@reach/router';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import {appMenuAtom} from 'store';
import UserMenu from 'views/components/app-menu/user-menu';
import pack from '../../../../package.json';
import Github from '../../../svg/github';


const AppMenuBase = (props: { children: React.ReactNode }) => {
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
        justifyContent: 'space-between',
    }}>
        <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <UserMenu/>
            <Box sx={{
                height: 'calc(100% - 88px)', // 88px usermenu + 50px bottom
                overflowY: 'auto',
                overflowX: 'hidden',
                flexShrink: 0
            }}>
                {props.children}
            </Box>
            <Box sx={{
                height: '50px',
                pt: '10px',
                flexShrink: 0,
                display: 'flex',
                fontSize: '0.8em',
                color: theme.palette.text.disabled
            }}>
                <Box sx={{mr: '20px'}}>{`NostrChat v${pack.version}`}</Box>
                <Box component="a" href="https://github.com/NostrChat/NostrChat" target="_blank" rel="noreferrer"
                     sx={{color: theme.palette.text.secondary}}>
                    <Github height={20} style={{marginRight: '4px'}}/>
                </Box>
            </Box>
        </Box>
    </Box>
}

export default AppMenuBase;
