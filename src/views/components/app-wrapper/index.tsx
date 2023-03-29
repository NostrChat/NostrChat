import React from 'react';
import {useAtom} from 'jotai';
import {useNavigate} from '@reach/router';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import useTranslation from 'hooks/use-translation';
import {backupWarnAtom} from 'store';
import Alert from 'svg/alert';


const AppWrapper = (props: { children: React.ReactNode }) => {
    const theme = useTheme();
    const [t,] = useTranslation();
    const navigate = useNavigate();
    const [backupWarn, setBackupWarn] = useAtom(backupWarnAtom);
    return <>
        {backupWarn && (
            <Box sx={{
                width: '100%',
                height: '36px',
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
                    <Alert height={18}
                           style={{marginRight: '6px'}}/> {t('Please take a moment to save a copy of your private key.')}
                </Box>
            </Box>
        )}
        <Box sx={{
            flexGrow: 1,
            width: '100%',
            height: backupWarn ? 'calc(100% - 36px)' : '100%',
            overflow: 'hidden',
            display: 'flex',
        }}>
            {props.children}
        </Box>
    </>
}

export default AppWrapper;
