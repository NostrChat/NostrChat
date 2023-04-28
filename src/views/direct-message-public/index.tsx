import {useEffect, useMemo, useState} from 'react';
import {RouteComponentProps, useNavigate} from '@reach/router';
import {useAtom} from 'jotai';
import {Helmet} from 'react-helmet';
import {nip19} from 'nostr-tools';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import LoginDialog from 'views/components/dialogs/login';
import ProfileCard from 'views/direct-message/components/profile-card';
import useTranslation from 'hooks/use-translation';
import useModal from 'hooks/use-modal';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import Raven from 'raven/raven';
import {Profile} from 'types';
import {profileToDmAtom} from 'store';


const DirectMessagePublic = (props: RouteComponentProps) => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const [, showModal] = useModal();
    const {isSm} = useMediaBreakPoint();
    const [, setProfileToDm] = useAtom(profileToDmAtom);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [notFound, setNotFound] = useState(false);
    const raven = useMemo(() => new Raven('', ''), []);

    const [npub, pub] = useMemo((): [string | null, string | null] => {
        if ('npub' in props) {
            const npub = props.npub as string;
            try {
                return [npub, nip19.decode(npub).data as string]
            } catch (e) {
            }
        }
        return [null, null];

    }, [props]);

    useEffect(() => {
        if (!npub) navigate('/').then();
    }, [npub]);

    useEffect(() => {
        if (!pub) return;

        const timer = setTimeout(() => setNotFound(true), 5000);

        raven.fetchProfile(pub).then(profile => {
            if (profile) {
                setProfile(profile);
                clearTimeout(timer);
            }
        });

        return () => clearTimeout(timer);
    }, [raven, pub]);

    const onDone = () => {
        showModal(null);
        if (profile) setProfileToDm(profile);
    }

    const onDM = () => {
        showModal({
            body: <LoginDialog onDone={onDone}/>
        });
    }

    if (profile && pub) {
        return <>
            <Helmet><title>{t(`NostrChat - ${profile.name || npub}`)}</title></Helmet>
            <Box sx={{maxWidth: isSm ? '500px' : '300px', ml: '10px', mr: '10px'}}>
                <ProfileCard profile={profile} pub={pub} onDM={onDM}/>
            </Box>
        </>
    }

    return <>
        <Helmet><title>{t('NostrChat')}</title></Helmet>
        <Box sx={{display: 'flex', alignItems: 'center'}}>
            {(() => {
                if (notFound) return t('Profile not found');
                return <><CircularProgress size={20} sx={{mr: '8px'}}/> {t('Loading...')}</>
            })()}
        </Box>
    </>
}

export default DirectMessagePublic;
