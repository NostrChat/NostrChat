import React, {useEffect} from 'react';
import {useAtom} from 'jotai';
import {useLocation, useNavigate} from '@reach/router';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import useTranslation from 'hooks/use-translation';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import usePopover from 'hooks/use-popover';
import useModal from 'hooks/use-modal';
import PrivRequester from 'views/components/app-wrapper/priv-requester';
import {backupWarnAtom} from 'atoms';
import Alert from 'svg/alert';


const AppWrapper = (props: { children: React.ReactNode }) => {
    const theme = useTheme();
    const {isSm} = useMediaBreakPoint();
    const [t,] = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [backupWarn, setBackupWarn] = useAtom(backupWarnAtom);
    const [, setPopover] = usePopover();
    const [, setModal] = useModal();

    // Hide popover and modal on page change
    useEffect(() => {
        setPopover(null);
        setModal(null);
    }, [location.pathname]);

    const warnHeight = isSm ? '36px' : '50px';

    return <>
        {backupWarn && (
            <Box sx={{
                width: '100%',
                height: warnHeight,
                background: theme.palette.warning.main,
                color: '#000',
                fontSize: '0.9em',
                display: 'flex',
                justifyContent: 'center',
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                }} onClick={() => {
                    navigate('/settings/keys').then();
                    setBackupWarn(false);
                }}>
                    <Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: '10px',
                        ml: isSm ? null : '10px'
                    }}>
                        <Alert height={18}/>
                    </Box>
                    {t('Please take a moment to save a copy of your private key.')}
                </Box>
            </Box>
        )}
        <Box sx={{
            flexGrow: 1,
            width: '100%',
            height: backupWarn ? `calc(100% - ${warnHeight})` : '100%',
            overflow: 'hidden',
            display: 'flex',
        }}>
            {props.children}
        </Box>
        <PrivRequester />
    </>
}

export default AppWrapper;
