import React, {useEffect, useState} from 'react';
import {useAtom} from 'jotai';
import {RouteComponentProps, useNavigate} from '@reach/router';
import {Helmet} from 'react-helmet';
import isEqual from 'lodash.isequal';
import AppWrapper from 'views/components/app-wrapper';
import AppContent from 'views/components/app-content';
import AppMenu from 'views/components/app-menu';
import ChannelHeader from 'views/channel/components/channel-header';
import ChatInput from 'views/components/chat-input';
import ChatView from 'views/components/chat-view';
import ThreadChatView from 'views/components/thread-chat-view';
import ChannelInfo from 'views/components/dialogs/channel-info';
import useTranslation from 'hooks/use-translation';
import useLiveChannels from 'hooks/use-live-channels';
import useLiveChannel from 'hooks/use-live-channel';
import useLivePublicMessages from 'hooks/use-live-public-messages';
import useToast from 'hooks/use-toast';
import useModal from 'hooks/use-modal';
import {channelAtom, commonTsAtom, keysAtom, ravenAtom, ravenReadyAtom, threadRootAtom} from 'store';
import {RavenEvents} from 'raven/raven';
import {ACCEPTABLE_LESS_PAGE_MESSAGES, GLOBAL_CHAT, MESSAGE_PER_PAGE} from 'const';
import {Channel} from 'types';
import {isSha256} from 'util/crypto';


const ChannelPage = (props: RouteComponentProps) => {
    const [keys] = useAtom(keysAtom);
    const navigate = useNavigate();
    const [t] = useTranslation();
    const [, showModal] = useModal();
    const [, showMessage] = useToast();
    const channels = useLiveChannels();
    const channel = useLiveChannel();
    const messages = useLivePublicMessages(channel?.id);
    const [, setChannel] = useAtom(channelAtom);
    const [threadRoot, setThreadRoot] = useAtom(threadRootAtom);
    const [ravenReady] = useAtom(ravenReadyAtom);
    const [raven] = useAtom(ravenAtom);
    const [commonTs] = useAtom(commonTsAtom);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [channelLoaded, setChannelLoaded] = useState<Channel | null>(null);

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
            if (!hasMore || loading) return;
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
    }, [messages, channel, hasMore, loading]);

    useEffect(() => {
        const msg = messages.find(x => x.id === threadRoot?.id);
        if (threadRoot && msg && !isEqual(msg, threadRoot)) {
            setThreadRoot(msg);
        }
    }, [messages, threadRoot]);

    useEffect(() => {
        let timer: any = null;
        if (('channel' in props && isSha256(props.channel as string) && ravenReady) && !channel && !channelLoaded) {
            timer = setTimeout(() => {
                raven?.fetchChannel(props.channel as string).then(setChannelLoaded);
            }, 1000);
        }

        return () => {
            clearTimeout(timer);
        }
    }, [raven, ravenReady, channels, props]);

    useEffect(() => {
        if (channelLoaded && !channel) {
            showModal({
                body: <ChannelInfo channel={channelLoaded}/>
            })
        } else if (channel) {
            showModal(null);
        }
    }, [channelLoaded, channel]);

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
