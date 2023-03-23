import React from 'react';
import {useNavigate} from '@reach/router';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import {Tooltip} from '@mui/material';
import useTranslation from 'hooks/use-translation';
import Cog from 'svg/cog';

const BottomMenu = () => {
    const theme = useTheme();
    const [t] = useTranslation();
    const navigate = useNavigate();

    const settingsClicked = () => {
        navigate('/settings').then();
    }

    return <>
        <Tooltip title={t('Settings')}><Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            borderRadius: '50%',
            transition: 'background-color 100ms linear',
            opacity: 0.6,
            ':hover': {
                background: theme.palette.divider,
                opacity: 1
            }
        }} onClick={settingsClicked}>
            <Cog width={24}/>
        </Box>
        </Tooltip>
    </>
}

export default BottomMenu;
