import {useEffect, useState} from 'react';
import {useAtom} from 'jotai';
import {RouteComponentProps, useNavigate} from '@reach/router';
import {Helmet} from 'react-helmet';
import AppWrapper from 'views/components/app-wrapper';
import AppContent from 'views/components/app-content';
import AppMenu from 'views/components/app-menu';
import ChannelHeader from 'views/channel/components/channel-header';
import ChatInput from 'views/components/chat-input';
import ChatView from 'views/components/chat-view';
import useTranslation from 'hooks/use-translation';
import useLiveChannels from 'hooks/use-live-channels';
import useLiveChannel from 'hooks/use-live-channel';
import useLivePublicMessages from 'hooks/use-live-public-messages';
import useToast from 'hooks/use-toast';
import {channelAtom, commonTsAtom, keysAtom, ravenAtom, ravenReadyAtom} from 'store';
import {RavenEvents} from 'raven/raven';
import {ACCEPTABLE_LESS_PAGE_MESSAGES, GLOBAL_CHAT, MESSAGE_PER_PAGE} from 'const';
import {Channel} from 'types';


const ChannelPage = (props: RouteComponentProps) => {
    const [keys] = useAtom(keysAtom);
    const navigate = useNavigate();
    const [t] = useTranslation();
    const [, showMessage] = useToast();
    const channels = useLiveChannels();
    const channel = useLiveChannel();
    const messages = useLivePublicMessages(channel?.id);
    const [, setChannel] = useAtom(channelAtom);
    const [ravenReady] = useAtom(ravenReadyAtom);
    const [raven] = useAtom(ravenAtom);
    const [commonTs] = useAtom(commonTsAtom);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (!('channel' in props)) {
            navigate(`/channel/${GLOBAL_CHAT.id}`).then();
        }
    }, [props]);

    useEffect(() => {
        if (!keys) {
            navigate('/login').then();
        }
    }, [keys]);

    useEffect(() => {
        if ('channel' in props) {
            const {channel: cid} = props;
            const c = channels.find(x => x.id === cid);
            if (c) {
                setChannel(c);
            }
        }
    }, [props, channels]);


    useEffect(() => {
        const handleChannelCreation = (data: Channel[]) => {
            if (data.length === 1 && data[0].created <= commonTs + 10) {
                navigate(`/channel/${data[0].id}`).then();
            }
        }

        raven?.removeListener(RavenEvents.ChannelCreation, handleChannelCreation);
        raven?.addListener(RavenEvents.ChannelCreation, handleChannelCreation);

        return () => {
            raven?.removeListener(RavenEvents.ChannelCreation, handleChannelCreation);
        }
    }, [channels, commonTs, raven]);

    useEffect(() => {
        const fetchPrev = () => {
            if (!hasMore) {
                return;
            }
            setLoading(true);
            raven?.fetchPrevMessages(channel!.id, messages[0].created).then((num) => {
                if (num < (MESSAGE_PER_PAGE - ACCEPTABLE_LESS_PAGE_MESSAGES)) {
                    setHasMore(false);
                }
            }).finally(() => {
                setLoading(false);
            })
        }
        window.addEventListener('chat-view-top', fetchPrev);

        return () => {
            window.removeEventListener('chat-view-top', fetchPrev);
        }
    }, [messages, channel, hasMore]);

    if (!keys) {
        return null;
    }

    if (!('channel' in props) || !keys) {
        return null;
    }

    if (!channel || !ravenReady) {
        return <>Loading...</>
    }

    return <>
        <Helmet><title>{t(`NostrChat - ${channel.name}`)}</title></Helmet>
        <AppWrapper>
            <AppMenu/>
            <AppContent>
                <ChannelHeader/>
                <ChatView separator={channel.id} messages={messages} loading={loading}/>
                <ChatInput separator={channel.id} senderFn={(message: string) => {
                    raven?.sendPublicMessage(channel, message).catch(e => {
                        showMessage(e, 'error');
                    });
                }}/>
            </AppContent>
        </AppWrapper>
    </>;
}

export default ChannelPage;
