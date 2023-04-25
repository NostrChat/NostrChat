import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import {useAtom} from 'jotai';
import {nip06, getPublicKey} from 'nostr-tools';

import {InstallNip07Dialog} from 'views/components/dialogs/no-wallet/nip07';
import ImportAccount from 'views/components/dialogs/import-account';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import useTranslation from 'hooks/use-translation';
import useModal from 'hooks/use-modal';
import {keysAtom, profileAtom, backupWarnAtom} from 'store';
import Creation from 'svg/creation';
import Import from 'svg/import';
import Wallet from 'svg/wallet';

const Login = (props: {onLogin: () => void}) => {
    const {onLogin} = props;
    const {isSm} = useMediaBreakPoint();
    const [t,] = useTranslation();
    const [, showModal] = useModal();
    const [, setKeys] = useAtom(keysAtom);
    const [, setProfile] = useAtom(profileAtom);
    const [, setBackupWarn] = useAtom(backupWarnAtom);

    const createAccount = () => {
        const priv = nip06.privateKeyFromSeedWords(nip06.generateSeedWords());
        loginPriv(priv);
        setBackupWarn(true);
    }

    const importAccount = () => {
        showModal({
            body: <ImportAccount onSuccess={(priv: string) => {
                showModal(null);
                loginPriv(priv);
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
        if (pub) proceed('nip07', pub);
    }

    const loginPriv = (priv: string) => {
        const pub = getPublicKey(priv);
        proceed(priv, pub);
    }

    const proceed = (priv: string, pub: string) => {
        const keys = {priv, pub};
        localStorage.setItem('keys', JSON.stringify(keys));
        setKeys({priv, pub});
        setProfile(null);
        onLogin();
    }

    return <>
        <Box component="img" src="/logo-large-white.png" sx={{
            width: isSm ? '526px' : '100%',
            height: isSm ? '132px' : null,
            m: '20px 0 10px 0'
        }}/>
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
    </>
}

export default Login;
