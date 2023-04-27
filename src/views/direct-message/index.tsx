import {useEffect, useMemo} from 'react';
import {useAtom} from 'jotai';
import {RouteComponentProps, useNavigate} from '@reach/router';
import {Helmet} from 'react-helmet';
import isEqual from 'lodash.isequal';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import AppWrapper from 'views/components/app-wrapper';
import AppContent from 'views/components/app-content';
import AppMenu from 'views/components/app-menu';
import ChatInput from 'views/components/chat-input';
import ChatView from 'views/components/chat-view';
import DmHeader from 'views/direct-message/components/dm-header';
import ThreadChatView from 'views/components/thread-chat-view';
import useTranslation from 'hooks/use-translation';
import useLiveDirectMessages from 'hooks/use-live-direct-messages';
import {
    directContactsAtom,
    directMessageAtom,
    keysAtom,
    muteListAtom,
    profilesAtom,
    ravenAtom,
    ravenReadyAtom,
    threadRootAtom
} from 'store';


const DirectMessagePage = (props: RouteComponentProps) => {
    const [keys] = useAtom(keysAtom);
    const navigate = useNavigate();
    const [t] = useTranslation();
    const [directMessage, setDirectMessage] = useAtom(directMessageAtom);
    const [directContacts] = useAtom(directContactsAtom);
    const [threadRoot, setThreadRoot] = useAtom(threadRootAtom);
    const [ravenReady] = useAtom(ravenReadyAtom);
    const [muteList] = useAtom(muteListAtom);
    const [raven] = useAtom(ravenAtom);
    const [profiles] = useAtom(profilesAtom);
    const messages = useLiveDirectMessages(directMessage || undefined);

    useEffect(() => {
        if (!('pub' in props)) {
            navigate('/').then();
        }
    }, [props]);

    useEffect(() => {
        if (!keys) {
            navigate('/login').then();
        }
    }, [keys]);

    useEffect(() => {
        if ('pub' in props) {
            const {pub} = props;
            const c = directContacts.find(x => x.npub === pub);
            if (c) {
                setDirectMessage(c.pub);
            }
        }
    }, [props, directContacts]);

    useEffect(() => {
        if ('pub' in props) {
            const {pub} = props;
            const contact = directContacts.find(x => x.npub === pub);
            if (muteList.pubkeys.find(x => x === contact?.pub)) {
                navigate('/').then();
            }
        }

    }, [props, muteList]);

    useEffect(() => {
        const msg = messages.find(x => x.id === threadRoot?.id);
        if (threadRoot && msg && !isEqual(msg, threadRoot)) {
            setThreadRoot(msg);
        }
    }, [messages, threadRoot]);

    const profile = useMemo(() => profiles.find(x => x.creator === directMessage), [profiles, directMessage]);

    if (!('pub' in props) || !keys) return null;

    if (!ravenReady) {
        return <Box sx={{display: 'flex', alignItems: 'center'}}>
            <CircularProgress size={20} sx={{mr: '8px'}}/> {t('Loading...')}
        </Box>;
    }

    if (!directMessage) {
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
                            return null;
                        })()}
                    </Box>
                </AppContent>
            </AppWrapper>
        </>
    }

    return <>
        <Helmet><title>{t(`NostrChat - ${profile ? profile.name : directMessage}`)}</title></Helmet>
        <AppWrapper>
            <AppMenu/>
            <AppContent divide={!!threadRoot}>
                <DmHeader/>
                <ChatView separator={directMessage} messages={messages}/>
                <ChatInput separator={directMessage} senderFn={(message: string) => {
                    return raven!.sendDirectMessage(directMessage, message);
                }}/>
            </AppContent>
            {threadRoot && <ThreadChatView senderFn={(message: string) => {
                return raven!.sendDirectMessage(directMessage, message, threadRoot.id);
            }}/>}
        </AppWrapper>
    </>;
}

export default DirectMessagePage;
