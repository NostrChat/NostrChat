import {useEffect, useState} from 'react';
import {RouteComponentProps, useNavigate} from '@reach/router';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import {useTheme} from '@mui/material/styles';
import {Helmet} from 'react-helmet';
import {useAtom} from 'jotai';
import {nip06, getPublicKey} from 'nostr-tools';

import {InstallNip07Dialog} from 'views/components/dialogs/no-wallet/nip07';
import ImportAccount from 'views/components/dialogs/import-account';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import useTranslation from 'hooks/use-translation';
import useModal from 'hooks/use-modal';
import {keysAtom, profileAtom} from 'store';
import Creation from 'svg/creation';
import Import from 'svg/import';
import Wallet from 'svg/wallet';
import Github from 'svg/github';


const LoginPage = (_: RouteComponentProps) => {
    const theme = useTheme();
    const [isSm,] = useMediaBreakPoint();
    const [t,] = useTranslation();
    const [, showModal] = useModal();
    const [, setKeys] = useAtom(keysAtom);
    const [profile, setProfile] = useAtom(profileAtom);
    const navigate = useNavigate();
    const [redirFlag, setRedirFlag] = useState(false);

    useEffect(() => {
        if (redirFlag) {
            setTimeout(() => {
                let redir = '/';
                if (!profile) {
                    redir = '/welcome';
                }
                navigate(redir).then();
            }, 600);
        }
    }, [redirFlag]);

    const createAccount = () => {
        const priv = nip06.privateKeyFromSeedWords(nip06.generateSeedWords());
        proceed(priv);
    }

    const importAccount = () => {
        showModal({
            body: <ImportAccount onSuccess={(priv: string) => {
                showModal(null);
                proceed(priv);
            }}/>
        });
    }

    const loginNip07 = async () => {
        if (!window.nostr) {
            showModal({
                body: <InstallNip07Dialog/>
            });
            return;
        }

        const pub = await window.nostr.getPublicKey();
        if (pub) {
            const keys = {priv: 'nip07', pub};
            localStorage.setItem('keys', JSON.stringify(keys));
            setKeys({priv: 'nip07', pub});
            setProfile(null);
            setRedirFlag(true);
        }
    }

    const proceed = (priv: string) => {
        const pub = getPublicKey(priv);
        const keys = {priv, pub};
        localStorage.setItem('keys', JSON.stringify(keys));
        setKeys({priv, pub});
        setProfile(null);
        setRedirFlag(true);
    }

    return <>
        <Helmet><title>{t('NostrChat - Sign in')}</title></Helmet>
        <Box sx={{
            width: isSm ? '590px' : '96%'
        }}>
            <Card sx={{
                p: '26px 32px 46px 32px',
            }}>
                <Box component="img" src="/logo-large-white.png" sx={{
                    width: '100%',
                    m: '20px 0 10px 0'
                }} />
                <Divider sx={{m: '28px 0'}}/>
                <Box sx={{color: 'text.secondary', mb: '28px'}}>{t('Sign in to get started')}</Box>
                <Box sx={{
                    display: 'flex',
                    flexDirection: isSm ? 'row' : 'column'
                }}>
                    <Button variant="login" size="large" disableElevation fullWidth onClick={createAccount}
                            sx={{
                                mb: '22px',
                                p: '20px 26px',
                                mr: isSm ? '22px' : null,
                            }}
                            startIcon={<Creation width={38}/>}>
                        {t('Create Nostr Account')}
                    </Button>
                    <Button variant="login" size="large" disableElevation fullWidth onClick={importAccount}
                            sx={{mb: '22px', p: '20px 26px'}} startIcon={<Import width={38}/>}>
                        {t('Import Nostr Account')}
                    </Button>
                </Box>
                <Button variant="login" size="large" disableElevation fullWidth onClick={loginNip07}
                        sx={{p: '14px'}} startIcon={<Wallet height={20}/>}>
                    {t('Use NIP-07 Wallet')}
                </Button>
            </Card>
            <Box sx={{mt: '20px', fontSize: '0.8em', display: 'flex', justifyContent: 'center'}}>
                <Box component="a" href="https://github.com/NostrChat/NostrChat" target="_blank" rel="noreferrer"
                     sx={{display: 'inline-flex', alignItems: 'center', color: theme.palette.text.secondary}}>
                    <Github height={20} style={{marginRight: '4px'}}/> {'Github'}
                </Box>
            </Box>
        </Box>
    </>;
}

export default LoginPage;
