import React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import {useTheme} from '@mui/material/styles';
import useTranslation from 'hooks/use-translation';
import {Channel} from 'types';
import {truncate} from 'util/truncate';


const ChannelInfo = (props: { channel: Channel, onJoin: () => void }) => {
    const {channel, onJoin} = props;
    const theme = useTheme();
    const [t] = useTranslation();

    const hasPicture = channel.picture.startsWith('https://');

    const join = () => onJoin();

    return <Paper sx={{textAlign: 'center', p: '20px'}}>
        {hasPicture && (
            <>
                <Box sx={{mb: '10px'}}>
                    <Box component="img" sx={{
                        width: '140px',
                        height: '140px',
                        borderRadius: theme.shape.borderRadius
                    }} src={channel.picture} alt={channel.name}/>
                </Box>
            </>
        )}
        <Box sx={{
            fontFamily: 'Faktum, sans-serif',
            fontSize: '1.1em',
        }}>{truncate(channel.name, 60)}</Box>
        {channel.about && (
            <>
                <Divider sx={{m: '12px 0'}}/>
                <Box sx={{
                    color: theme.palette.primary.dark,
                    fontSize: '0.9em',
                    mb: '20px',
                }}>{truncate(channel.about, 360)}</Box>
            </>
        )}
        <Box><Button variant="contained" onClick={join}>{t('Join')}</Button></Box>
    </Paper>
}

export default ChannelInfo;
