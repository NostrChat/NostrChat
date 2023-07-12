import React from 'react';
import {useAtom} from 'jotai';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import {useTheme} from '@mui/material/styles';
import useTranslation from 'hooks/use-translation';
import {Channel} from 'types';
import {keysAtom, leftChannelListAtom} from 'atoms';
import {truncate} from 'util/truncate';


const ChannelCard = (props: { channel: Channel, onJoin: () => void }) => {
    const {channel, onJoin} = props;
    const theme = useTheme();
    const [t] = useTranslation();
    const [keys] = useAtom(keysAtom);
    const [leftChannelList] = useAtom(leftChannelListAtom);

    const hasPicture = channel.picture.startsWith('https://');
    const left = leftChannelList.includes(channel.id);

    const join = () => onJoin();

    return <Paper sx={{textAlign: 'center', p: '20px'}}>
        {hasPicture && (
            <>
                <Box sx={{mb: '10px'}}>
                    <Box component="img" sx={{
                        width: '140px',
                        height: '140px',
                        borderRadius: '50%'
                    }} src={channel.picture} alt={channel.name}/>
                </Box>
            </>
        )}
        <Box sx={{
            fontFamily: 'Faktum, sans-serif',
            fontSize: '1.1em',
        }}>{truncate(channel.name, 60)}</Box>
        <Divider sx={{m: '12px 0'}}/>
        {channel.about && (
            <>
                <Box sx={{
                    color: theme.palette.primary.dark,
                    fontSize: '0.9em',
                    mb: '20px',
                }}>{truncate(channel.about, 360)}</Box>
            </>
        )}
        <Box>
            {left && (
                <Box sx={{
                    mb: '20px',
                    color: theme.palette.text.secondary,
                    fontSize: '0.8em',
                }}>{t('You left this channel')}</Box>)}
            <Button variant="contained" onClick={join}>
                {keys ? (left ? t('Re-join') : t('Join')) : t('Login to Join')}
            </Button>
        </Box>
    </Paper>
}

export default ChannelCard;
