import {useEffect} from 'react';
import {useAtom} from 'jotai';
import {RouteComponentProps, useNavigate} from '@reach/router';
import {Helmet} from 'react-helmet';
import AppWrapper from 'views/components/app-wrapper';
import AppContent from 'views/components/app-content';
import AppMenu from 'views/components/app-menu';
import ChatInput from 'views/components/chat-input';
import ChatView from 'views/components/chat-view';
import DmHeader from 'views/direct-message/components/dm-header';
import ThreadView from 'views/components/thread-view';
import useTranslation from 'hooks/use-translation';
import useLiveDirectMessages from 'hooks/use-live-direct-messages';
import {
    directContactsAtom,
    directMessageAtom,
    keysAtom,
    muteListAtom,
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
    const [threadRoot,] = useAtom(threadRootAtom);
    const [ravenReady] = useAtom(ravenReadyAtom);
    const [muteList] = useAtom(muteListAtom);
    const [raven] = useAtom(ravenAtom);
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

    }, [props, muteList])

    if (!('pub' in props) || !keys) {
        return null;
    }

    if (!directMessage || !ravenReady) {
        return <>Loading...</>
    }

    return <>
        <Helmet><title>{t(`NostrChat - ${directMessage}`)}</title></Helmet>
        <AppWrapper>
            <AppMenu/>
            <AppContent divide={!!threadRoot}>
                <DmHeader/>
                <ChatView separator={directMessage} messages={messages}/>
                <ChatInput separator={directMessage} senderFn={(message: string) => {
                    raven?.sendDirectMessage(directMessage, message);
                }}/>
            </AppContent>
            {threadRoot && <ThreadView senderFn={(message: string) => {
                raven?.sendDirectMessage(directMessage, message, threadRoot.id);
            }}/>}
        </AppWrapper>
    </>;
}

export default DirectMessagePage;
