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
    directMessagesAtom,
    keysAtom,
    muteListAtom,
    ravenAtom,
    ravenReadyAtom,
    replyingToAtom
} from 'store';


const DirectMessagePage = (props: RouteComponentProps) => {
    const [keys] = useAtom(keysAtom);
    const navigate = useNavigate();
    const [t] = useTranslation();
    const [directMessage, setDirectMessage] = useAtom(directMessageAtom);
    const [directMessages, setDirectMessages] = useAtom(directMessagesAtom);
    const [directContacts] = useAtom(directContactsAtom);
    const [ravenReady] = useAtom(ravenReadyAtom);
    const [muteList] = useAtom(muteListAtom);
    const [raven] = useAtom(ravenAtom);
    const [replyingTo, setReplyingTo] = useAtom(replyingToAtom);
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
        if (directMessage) {
            // decrypt messages one by one. TODO: This might be handled in raven provider
            const decrypted = directMessages.filter(m => m.peer === directMessage).find(x => !x.decrypted);
            if (decrypted) {
                window.nostr?.nip04.decrypt(decrypted.peer, decrypted.content).then(content => {
                    setDirectMessages(directMessages.map(m => {
                        if (m.id === decrypted.id) {
                            return {
                                ...m,
                                content,
                                decrypted: true
                            }
                        }
                        return m;
                    }));
                })
            }
        }
    }, [directMessages, directMessage]);

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
            <AppContent>
                <DmHeader/>
                <ChatView separator={directMessage} messages={messages}/>
                <ChatInput separator={directMessage} senderFn={(message: string) => {
                    raven?.sendDirectMessage({toPubkey: directMessage, message, replyTo: replyingTo || undefined});
                    setReplyingTo(null);
                }}/>
            </AppContent>
        </AppWrapper>
    </>;
}

export default DirectMessagePage;
