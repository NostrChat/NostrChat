import {useEffect, useMemo, useState} from 'react';
import {RouteComponentProps, useNavigate} from '@reach/router';
import {Helmet} from 'react-helmet';
import {useAtom} from 'jotai';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import ChannelCard from 'views/components/channel-card';
import LoginDialog from 'views/components/dialogs/login';
import PublicBrand from 'views/components/public-brand';
import useTranslation from 'hooks/use-translation';
import useModal from 'hooks/use-modal';
import Raven from 'raven/raven';
import {Channel} from 'types';
import {channelToJoinAtom} from 'atoms';
import {isSha256} from 'util/crypto';

const ChannelPublicPage = (props: RouteComponentProps) => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const [, showModal] = useModal();
    const [, setChannelToJoin] = useAtom(channelToJoinAtom);
    const [channel, setChannel] = useState<Channel | null>(null);
    const [notFound, setNotFound] = useState(false);
    const raven = useMemo(() => new Raven('', ''), []);

    const cid = useMemo(() => ('channel' in props) && isSha256(props.channel as string) ? props.channel as string : null, [props]);

    useEffect(() => {
        if (!cid) navigate('/').then();
    }, [cid]);

    useEffect(() => {
        if (!cid) return;
        const timer = setTimeout(() => setNotFound(true), 5000);

        raven.fetchChannel(cid).then(channel => {
            if (channel) {
                setChannel(channel);
                clearTimeout(timer);
            }
        });

        return () => clearTimeout(timer);
    }, [raven, cid]);

    const onDone = () => {
        showModal(null);
        if (channel) setChannelToJoin(channel);
    }

    const onJoin = () => {
        showModal({
            body: <LoginDialog onDone={onDone}/>
        });
    }

    if (channel) {
        return <>
            <Helmet><title>{t(`NostrChat - ${channel.name}`)}</title></Helmet>
            <PublicBrand />
            <Box sx={{maxWidth: '500px', ml: '10px', mr: '10px'}}>
                <ChannelCard channel={channel} onJoin={onJoin}/>
            </Box>
        </>
    }

    return <>
        <Helmet><title>{t('NostrChat')}</title></Helmet>
        <PublicBrand />
        <Box sx={{display: 'flex', alignItems: 'center'}}>
            {(() => {
                if (notFound) return t('Channel not found');
                return <><CircularProgress size={20} sx={{mr: '8px'}}/> {t('Loading...')}</>
            })()}
        </Box>
    </>
}

export default ChannelPublicPage;
