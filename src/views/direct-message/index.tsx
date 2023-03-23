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
import useTranslation from 'hooks/use-translation';
import useLiveDirectMessages from 'hooks/use-live-direct-messages';
import {
    directContactsAtom,
    directMessageAtom,
    keysAtom,
    ravenAtom,
    ravenReadyAtom
} from 'store';


const DirectMessagePage = (props: RouteComponentProps) => {
    const [keys] = useAtom(keysAtom);
    const navigate = useNavigate();
    const [t] = useTranslation();
    const [directMessage, setDirectMessage] = useAtom(directMessageAtom);
    const [directContacts] = useAtom(directContactsAtom);
    const [ravenReady] = useAtom(ravenReadyAtom);
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
            <AppContent>
                <DmHeader/>
                <ChatView separator={directMessage} messages={messages}/>
                <ChatInput separator={directMessage} senderFn={(message: string) => {
                    raven?.sendDirectMessage(directMessage, message);
                }}/>
            </AppContent>
        </AppWrapper>
    </>;
}

export default DirectMessagePage;
