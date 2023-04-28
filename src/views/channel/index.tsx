import {useEffect, useMemo, useState} from 'react';
import {useAtom} from 'jotai';
import {RouteComponentProps, useLocation, useNavigate} from '@reach/router';
import {Helmet} from 'react-helmet';
import isEqual from 'lodash.isequal';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import AppWrapper from 'views/components/app-wrapper';
import AppContent from 'views/components/app-content';
import AppMenu from 'views/components/app-menu';
import ChannelHeader from 'views/channel/components/channel-header';
import ChatInput from 'views/components/chat-input';
import ChatView from 'views/components/chat-view';
import ThreadChatView from 'views/components/thread-chat-view';
import ChannelInfo from 'views/channel/components/channel-info';
import useTranslation from 'hooks/use-translation';
import useLiveChannels from 'hooks/use-live-channels';
import useLiveChannel from 'hooks/use-live-channel';
import useLivePublicMessages from 'hooks/use-live-public-messages';
import useToast from 'hooks/use-toast';
import {channelAtom, keysAtom, ravenAtom, ravenReadyAtom, threadRootAtom, channelToJoinAtom} from 'store';
import {ACCEPTABLE_LESS_PAGE_MESSAGES, GLOBAL_CHAT, MESSAGE_PER_PAGE} from 'const';
import {isSha256} from 'util/crypto';


const ChannelPage = (props: RouteComponentProps) => {
    const [keys] = useAtom(keysAtom);
    const navigate = useNavigate();
    const location = useLocation();
    const [t] = useTranslation();
    const [, showMessage] = useToast();
    const channels = useLiveChannels();
    const channel = useLiveChannel();
    const messages = useLivePublicMessages(channel?.id);
    const [, setChannel] = useAtom(channelAtom);
    const [threadRoot, setThreadRoot] = useAtom(threadRootAtom);
    const [ravenReady] = useAtom(ravenReadyAtom);
    const [raven] = useAtom(ravenAtom);
    const [channelToJoin, setChannelToJoin] = useAtom(channelToJoinAtom);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const cid = useMemo(() => ('channel' in props) && isSha256(props.channel as string) ? props.channel as string : null, [props]);

    useEffect(() => {
        if (!cid) navigate(`/channel/${GLOBAL_CHAT.id}`).then();
    }, [cid]);

    useEffect(() => {
        if (!keys) navigate('/login').then();
    }, [keys]);

    useEffect(() => {
        return () => setChannelToJoin(null);
    }, [location]);

    useEffect(() => {
        if (!cid) return;
        setChannel(channels.find(x => x.id === cid) || null);
    }, [cid, channels]);

    useEffect(() => {
        const fetchPrev = () => {
            if (!hasMore || loading) return;
            setLoading(true);
            raven?.fetchPrevMessages(channel!.id, messages[0].created).then((num) => {
                if (num < (MESSAGE_PER_PAGE - ACCEPTABLE_LESS_PAGE_MESSAGES)) {
                    setHasMore(false);
                }
            }).finally(() => setLoading(false));
        }
        window.addEventListener('chat-view-top', fetchPrev);

        return () => {
            window.removeEventListener('chat-view-top', fetchPrev);
        }
    }, [messages, channel, hasMore, loading]);

    useEffect(() => {
        const msg = messages.find(x => x.id === threadRoot?.id);
        if (threadRoot && msg && !isEqual(msg, threadRoot)) {
            setThreadRoot(msg);
        }
    }, [messages, threadRoot]);

    useEffect(() => {
        if (ravenReady && !channel && cid && !channelToJoin) {
            const timer = setTimeout(() => setNotFound(true), 5000);

            raven?.fetchChannel(cid).then(channel => {
                if (channel) {
                    setChannelToJoin(channel);
                    clearTimeout(timer);
                }
            });

            return () => clearTimeout(timer);
        }
    }, [ravenReady, channel, cid, channelToJoin]);

    if (!cid || !keys) return null;

    if (!ravenReady) {
        return <Box sx={{display: 'flex', alignItems: 'center'}}>
            <CircularProgress size={20} sx={{mr: '8px'}}/> {t('Loading...')}
        </Box>;
    }

    if (!channel) {
        return <>
            <Helmet><title>{t('NostrChat')}</title></Helmet>
            <AppWrapper>
                <AppMenu/>
                <AppContent>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%'
                    }}>
                        {(() => {
                            if (channelToJoin) {
                                return <Box sx={{maxWidth: '500px', ml: '10px', mr: '10px'}}>
                                    <ChannelInfo channel={channelToJoin} onJoin={() => {
                                        raven?.loadChannel(channelToJoin.id);
                                        setChannelToJoin(null);
                                    }}/>
                                </Box>;
                            }

                            if (notFound) return t('Channel not found');

                            return <>
                                <CircularProgress size={20} sx={{mr: '8px'}}/> {t('Looking for the channel...')}
                            </>;
                        })()}
                    </Box>
                </AppContent>
            </AppWrapper>
        </>
    }

    return <>
        <Helmet><title>{t(`NostrChat - ${channel.name}`)}</title></Helmet>
        <AppWrapper>
            <AppMenu/>
            <AppContent divide={!!threadRoot}>
                <ChannelHeader/>
                <ChatView separator={channel.id} messages={messages} loading={loading}/>
                <ChatInput separator={channel.id} senderFn={(message: string) => {
                    return raven!.sendPublicMessage(channel, message).catch(e => {
                        showMessage(e, 'error');
                    });
                }}/>
            </AppContent>
            {threadRoot && <ThreadChatView senderFn={(message: string) => {
                return raven!.sendPublicMessage(channel, message, [threadRoot.creator], threadRoot.id).catch(e => {
                    showMessage(e, 'error');
                });
            }}/>}
        </AppWrapper>
    </>;
}

export default ChannelPage;
