import React from 'react';
import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {useLocation} from '@reach/router';
import useTranslation from 'hooks/use-translation';
import useSettingsSections from 'hooks/use-settings-sections';
import AppMenuBase from 'views/components/app-menu-base';
import ListItem from 'views/components/app-menu/list-item';
import ArrowLeft from 'svg/arrow-left';

const SettingsMenu = () => {
    const theme = useTheme();
    const [t] = useTranslation();
    const sections = useSettingsSections();
    const location = useLocation();

    return <AppMenuBase>
        <Box sx={{
            mt: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <Box sx={{
                fontFamily: 'Faktum, sans-serif',
                fontWeight: 'bold',
                color: theme.palette.primary.dark,
            }}>{t('Settings')}</Box>
        </Box>
        {sections.map(s => {
            return <ListItem key={s.title} label={s.title} href={s.href} selected={location.pathname === s.href}/>
        })}

        <ListItem
            label={<Box sx={{display: 'flex', alignItems: 'center'}}>
                <ArrowLeft height={16} style={{marginRight: '6px'}}/> {t('Chat')}
            </Box>}
            href={'/'} selected={false}/>
    </AppMenuBase>
}

export default SettingsMenu;
