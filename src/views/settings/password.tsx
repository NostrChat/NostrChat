import {useEffect} from 'react';
import {useAtom} from 'jotai';
import {RouteComponentProps, useNavigate} from '@reach/router';
import {Helmet} from 'react-helmet';
import useTranslation from 'hooks/use-translation';
import AppWrapper from 'views/components/app-wrapper';
import AppContent from 'views/components/app-content';
import SettingsMenu from 'views/settings/components/settings-menu';
import SettingsHeader from 'views/settings/components/settings-header';
import SettingsContent from 'views/settings/components/settings-content';
import {keysAtom} from 'store';


const SettingsPasswordPage = (props: RouteComponentProps) => {
    const [keys] = useAtom(keysAtom);
    const navigate = useNavigate();
    const [t] = useTranslation();

    useEffect(() => {
        if (!keys) {
            navigate('/login').then();
        }
    }, [keys]);

    return <>
        <Helmet><title>{t('NostrChat - Password protection')}</title></Helmet>
        <AppWrapper>
            <SettingsMenu/>
            <AppContent>
                <SettingsHeader section={t('Password protection')}/>
                <SettingsContent>
                    Coming soon...
                </SettingsContent>
            </AppContent>
        </AppWrapper>
    </>;
}

export default SettingsPasswordPage;
