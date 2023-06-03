import {Box} from '@mui/material';
import React from 'react';
import {useTheme} from '@mui/material/styles';
import Button from '@mui/material/Button';
import {useAtom} from 'jotai';
import {useLocation, useNavigate} from '@reach/router';
import useTranslation from 'hooks/use-translation';
import ListItem from 'views/components/app-menu/list-item';
import StartDM from 'views/components/dialogs/start-dm';
import useLiveDirectContacts from 'hooks/use-live-direct-contacts';
import useLiveDirectMessages from 'hooks/use-live-direct-messages';
import useModal from 'hooks/use-modal';
import {directMessageAtom, profilesAtom, readMarkMapAtom} from 'store';
import Plus from 'svg/plus';
import {DirectContact} from 'types';
import {truncateMiddle} from 'util/truncate';

const DmListItem = (props: { contact: DirectContact }) => {
    const {contact} = props;

    const [profiles] = useAtom(profilesAtom);
    const [directMessage] = useAtom(directMessageAtom);
    const [readMarkMap] = useAtom(readMarkMapAtom);
    const location = useLocation();
    const messages = useLiveDirectMessages(contact.pub);

    const lMessage = messages[messages.length - 1];
    const hasUnread = !!(readMarkMap[contact.pub] && lMessage && lMessage.created > readMarkMap[contact.pub]);

    const profile = profiles.find(x => x.creator === contact.pub);
    const label = profile?.name || truncateMiddle(contact.npub, 28, ':');
    const isSelected = contact.pub === directMessage && location.pathname.startsWith('/dm/');

    return <ListItem label={label} href={`/dm/${contact.npub}`} selected={isSelected} hasUnread={hasUnread}/>;
}

const DmList = () => {
    const theme = useTheme();
    const [t] = useTranslation();
    const directContacts = useLiveDirectContacts();
    const [, showModal] = useModal();
    const navigate = useNavigate();

    const search = () => {
        showModal({
            body: <StartDM onSuccess={(id) => {
                showModal(null);
                navigate(`/dm/${id}`).then();
            }}/>
        })
    }

    return <>
        <Box sx={{
            mt: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <Box sx={{
                fontFamily: 'Faktum, sans-serif',
                fontWeight: 'bold',
                color: theme.palette.primary.dark,

            }}>
                {t('DMs')}
            </Box>
            <Button onClick={search} sx={{minWidth: 'auto'}}><Plus height={18}/></Button>
        </Box>
        {(() => {
            if (directContacts.length === 0) {
                return <Box component='span' sx={{
                    color: theme.palette.primary.dark,
                    fontSize: '85%',
                    opacity: '0.6',
                }}>{t('No direct message')}</Box>
            }

            return directContacts.map(p => <DmListItem key={p.npub} contact={p}/>);
        })()}
    </>
}

export default DmList;
