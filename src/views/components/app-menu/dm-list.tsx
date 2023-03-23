import {Box} from '@mui/material';
import React from 'react';
import {useTheme} from '@mui/material/styles';
import {useAtom} from 'jotai';
import {useLocation} from '@reach/router';
import useTranslation from 'hooks/use-translation';
import ListItem from 'views/components/app-menu/list-item';
import useLiveDirectContacts from 'hooks/use-live-direct-contacts';
import {directMessageAtom, profilesAtom} from 'store';
import {truncateMiddle} from 'util/truncate';

const DmList = () => {
    const theme = useTheme();
    const [t] = useTranslation();
    const [profiles] = useAtom(profilesAtom);
    const directContacts = useLiveDirectContacts();
    const [directMessage] = useAtom(directMessageAtom);
    const location = useLocation();

    return <>
        <Box sx={{
            fontFamily: 'Faktum, sans-serif',
            fontWeight: 'bold',
            color: theme.palette.primary.dark,
            mt: '40px'
        }}>
            {t('DMs')}
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
