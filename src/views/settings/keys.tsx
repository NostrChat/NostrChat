import React, {useEffect, useState} from 'react';
import {useAtom} from 'jotai';
import {RouteComponentProps, useNavigate} from '@reach/router';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import {useTheme} from '@mui/material/styles';
import {Helmet} from 'react-helmet';
import {nip19} from 'nostr-tools';
import useTranslation from 'hooks/use-translation';
import AppWrapper from 'views/components/app-wrapper';
import AppContent from 'views/components/app-content';
import SettingsMenu from 'views/settings/components/settings-menu';
import SettingsHeader from 'views/settings/components/settings-header';
import SettingsContent from 'views/settings/components/settings-content';
import CopyToClipboard from 'components/copy-clipboard';
import {keysAtom} from 'store';
import ContentCopy from 'svg/content-copy';
import Eye from 'svg/eye';
import EyeOff from 'svg/eye-off';
import Information from 'svg/information';


const SettingsKeysPage = (_: RouteComponentProps) => {
    const [keys] = useAtom(keysAtom);
    const navigate = useNavigate();
    const theme = useTheme();
    const [t] = useTranslation();
    const [reveal, setReveal] = useState(false);

    useEffect(() => {
        if (!keys) {
            navigate('/login').then();
        }
    }, [keys]);

    if (!keys) {
        return null;
    }


    const pub = nip19.npubEncode(keys.pub);

    return <>
        <Helmet><title>{t(`NostrChat - Keys`)}</title></Helmet>
        <AppWrapper>
            <SettingsMenu/>
            <AppContent>
                <SettingsHeader section={t('Keys')}/>
                <SettingsContent>
                    {(() => {

                        if (keys?.priv === 'nip07') {
                            return <Box sx={{
                                mb: '50px',
                                color: theme.palette.text.secondary,
                                fontSize: '0.8em',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Information height={18}/>
                                <Box sx={{ml: '6px'}}>{t('See your private key on the extension app.')}</Box>
                            </Box>;
                        }

                        const priv = nip19.nsecEncode(keys.priv);
                        return <>
                            <Box sx={{mb: '30px', color: theme.palette.text.secondary, fontSize: '0.8em'}}>
                                {t('Please make sure you have back up of your private key.')}
                            </Box>
                            <TextField sx={{mb: '30px'}} label={t('Private key')} value={reveal ? priv : 'x'.repeat(64)}
                                       fullWidth
                                       type={reveal ? 'text' : 'password'}
                                       helperText={<Box component="span" sx={{
                                           fontWeight: 'bold',
                                           color: theme.palette.warning.main,
                                           opacity: .7
                                       }}>
                                           {t('This is your private key. Do not share it with anyone else!')}
                                       </Box>}
                                       InputProps={{
                                           readOnly: true,
                                           endAdornment: <InputAdornment position="end">
                                               <Tooltip title={reveal ? t('Hide') : t('Reveal')}>
                                                   <IconButton onClick={() => {
                                                       setReveal(!reveal);
                                                   }}>
                                                       {reveal ? <EyeOff height={22}/> : <Eye height={22}/>}
                                                   </IconButton>
                                               </Tooltip>
                                               <CopyToClipboard copy={priv}>
                                                   <IconButton>
                                                       <ContentCopy height={22}/>
                                                   </IconButton>
                                               </CopyToClipboard>
                                           </InputAdornment>
                                       }}
                            />
                        </>
                    })()}
                    <TextField label={t('Public key')} value={pub} fullWidth
                               InputProps={{
                                   readOnly: true,
                                   endAdornment: <InputAdornment position="end">
                                       <CopyToClipboard copy={pub}>
                                           <IconButton>
                                               <ContentCopy height={22}/>
                                           </IconButton>
                                       </CopyToClipboard>
                                   </InputAdornment>
                               }}
                    />
                </SettingsContent>
            </AppContent>
        </AppWrapper>
    </>;
}

export default SettingsKeysPage;
