import {Box} from '@mui/material';
import React from 'react';
import {useTheme} from '@mui/material/styles';
import Button from '@mui/material/Button';
import {useAtom} from 'jotai';
import {useLocation, useNavigate} from '@reach/router';
import useTranslation from 'hooks/use-translation';
import ListItem from 'views/components/app-menu/list-item';
import useLiveDirectContacts from 'hooks/use-live-direct-contacts';
import useModal from 'hooks/use-modal';
import {directMessageAtom, profilesAtom} from 'store';
import Plus from 'svg/plus';
import {truncateMiddle} from 'util/truncate';
import JoinChannel from '../dialogs/join-channel';

const DmList = () => {
    const theme = useTheme();
    const [t] = useTranslation();
    const [profiles] = useAtom(profilesAtom);
    const directContacts = useLiveDirectContacts();
    const [directMessage] = useAtom(directMessageAtom);
    const location = useLocation();
    const [, showModal] = useModal();
    const navigate = useNavigate();

    const search = () => {
        showModal({
            body: <JoinChannel onSuccess={(id) => {
                showModal(null);
                navigate(`/channel/${id}`).then();
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
        <Box sx={{mt: '10px'}}>
            {(() => {
                if (directContacts.length === 0) {
                    return <Box component='span' sx={{
                        color: theme.palette.primary.dark,
                        fontSize: '85%',
                        opacity: '0.6',
                    }}>{t('No direct message')}</Box>
                }

                return directContacts.map(p => {
                    const profile = profiles.find(x => x.creator === p.pub);
                    const label = profile?.name || truncateMiddle(p.npub, 28, ':');
                    const isSelected = p.pub === directMessage && location.pathname.startsWith('/dm/');
                    return <ListItem key={p.npub} label={label} href={`/dm/${p.npub}`} selected={isSelected}/>
                })
            })()}
        </Box>
    </>
}

export default DmList;
