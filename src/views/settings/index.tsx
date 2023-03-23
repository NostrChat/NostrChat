import React, {useEffect} from 'react';
import {useAtom} from 'jotai';
import {RouteComponentProps, useNavigate} from '@reach/router';
import {Box, List, ListItemText, ListItemButton, ListItemAvatar} from '@mui/material';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import {useTheme} from '@mui/material/styles';
import {Helmet} from 'react-helmet';
import useTranslation from 'hooks/use-translation';
import AppWrapper from 'views/components/app-wrapper';
import AppContent from 'views/components/app-content';
import AppMenu from 'views/components/app-menu';
import useModal from 'hooks/use-modal';
import useSettingsSections from 'hooks/use-settings-sections';
import SettingsHeader from 'views/settings/components/settings-header';
import SettingsContent from 'views/settings/components/settings-content';
import ConfirmDialog from 'components/confirm-dialog';
import {keysAtom} from 'store';


const SettingsPage = (_: RouteComponentProps) => {
    const [keys, setKeys] = useAtom(keysAtom);
    const navigate = useNavigate();
    const [t] = useTranslation();
    const theme = useTheme();
    const [, showModal] = useModal();
    const sections = useSettingsSections();

    useEffect(() => {
        if (!keys) {
            navigate('/login').then();
        }
    }, [keys]);


    const logout = () => {
        showModal({
            body: <ConfirmDialog onConfirm={() => {
                localStorage.removeItem('keys');
                setKeys(null);
                window.location.href = '/';
            }}/>
        });
    }

    return <>
        <Helmet><title>{t('NostrChat - Settings')}</title></Helmet>
        <AppWrapper>
            <AppMenu/>
            <AppContent>
                <SettingsHeader/>
                <SettingsContent>
                    <List sx={{
                        width: '100%',
                        bgcolor: 'background.paper',
                        p: '0',
                        borderRadius: theme.shape.borderRadius
                    }}>
                        {sections.map((a, i) => {
                            return <React.Fragment key={i}>
                                <ListItemButton onClick={() => {
                                    navigate(a.href).then();
                                }}>
                                    <ListItemAvatar sx={{display: 'flex', alignItems: 'center',}}>
                                        {a.icon}
                                    </ListItemAvatar>
                                    <ListItemText primary={a.title}
                                                  secondary={<Box component="span"
                                                                  sx={{color: theme.palette.text.secondary}}>
                                                      {a.description}
                                                  </Box>}/>
                                </ListItemButton>
                                {i < sections.length - 1 && <Divider/>}
                            </React.Fragment>
                        })}
                    </List>
                    <Box sx={{mt: '20px', display: 'flex', justifyContent: 'flex-end'}}>
                        <Button variant="contained" color="error" onClick={logout}>{t('Logout')}</Button>
                    </Box>
                </SettingsContent>
            </AppContent>
        </AppWrapper>
    </>;
}

export default SettingsPage;
