import {useEffect, useMemo, useState} from 'react';
import {useAtom} from 'jotai';
import {RouteComponentProps, useLocation, useNavigate} from '@reach/router';
import {Helmet} from 'react-helmet';
import isEqual from 'lodash.isequal';
import {nip19} from 'nostr-tools';
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
    profileToDmAtom,
    ravenAtom,
    ravenReadyAtom,
    threadRootAtom
} from 'store';
import ProfileCard from '../components/profile-card';


const DirectMessagePage = (props: RouteComponentProps) => {
    const [keys] = useAtom(keysAtom);
    const navigate = useNavigate();
    const [t] = useTranslation();
    const location = useLocation();
    const [directMessage, setDirectMessage] = useAtom(directMessageAtom);
    const [directContacts] = useAtom(directContactsAtom);
    const [threadRoot, setThreadRoot] = useAtom(threadRootAtom);
    const [ravenReady] = useAtom(ravenReadyAtom);
    const [muteList] = useAtom(muteListAtom);
    const [raven] = useAtom(ravenAtom);
    const [profiles] = useAtom(profilesAtom);
    const [profileToDm, setProfileToDm] = useAtom(profileToDmAtom);
    const messages = useLiveDirectMessages(directMessage || undefined);
    const [notFound, setNotFound] = useState(false);

    const npub = useMemo(() => ('npub' in props) ? props.npub : null, [props]);
    const pub = useMemo(() => npub ? nip19.decode(npub as string).data as string : null, [npub]);

    useEffect(() => {
        if (!npub) navigate('/').then();
    }, [npub]);

    useEffect(() => {
        if (!keys) navigate('/login').then();
    }, [keys]);

    useEffect(() => {
        return () => setProfileToDm(null);
    }, [location]);

    useEffect(() => {
        if (!npub) return;
        const c = directContacts.find(x => x.npub === npub);
        setDirectMessage(c?.pub || null);
    }, [npub, directContacts]);

    useEffect(() => {
        if (!npub) return;
        const contact = directContacts.find(x => x.npub === npub);
        if (muteList.pubkeys.find(x => x === contact?.pub)) {
            navigate('/').then();
        }
    }, [npub, muteList]);

    useEffect(() => {
        const msg = messages.find(x => x.id === threadRoot?.id);
        if (threadRoot && msg && !isEqual(msg, threadRoot)) {
            setThreadRoot(msg);
        }
    }, [messages, threadRoot]);

    useEffect(() => {
        if (ravenReady && !directMessage && pub && !profileToDm) {
            const timer = setTimeout(() => {
                setNotFound(true);
            }, 5000);

            raven?.fetchProfile(pub).then(profile => {
                if (profile) {
                    setProfileToDm(profile);
                    clearTimeout(timer);
                }
            });

            return () => {
                clearTimeout(timer);
            }
        }
    }, [ravenReady, directMessage, props, profileToDm]);

    const profile = useMemo(() => profiles.find(x => x.creator === directMessage), [profiles, directMessage]);

    if (!npub || !pub || !keys) return null;

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
                            if (profileToDm) {
                                return <Box sx={{maxWidth: '500px', ml: '10px', mr: '10px'}}>
                                    <ProfileCard profile={profileToDm} pubkey={pub} onDM={() => {
                                    }}/>
                                </Box>
                            }

                            if (notFound) return t('Profile not found');

                            return <>
                                <CircularProgress size={20} sx={{mr: '8px'}}/> {t('Looking for the profile...')}
                            </>;
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
