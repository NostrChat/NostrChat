import React from 'react';
import {useAtom} from 'jotai';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {useTheme} from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import useTranslation from 'hooks/use-translation';
import {ravenAtom} from 'store';
import {Channel} from 'types';
import {truncate} from 'util/truncate';


const ChannelInfo = (props: { channel: Channel }) => {
    const {channel} = props;
    const theme = useTheme();
    const [t] = useTranslation();
    const [raven] = useAtom(ravenAtom);

    const join = () => {
        raven?.loadChannel(channel.id);
    }

    const hasPicture = channel.picture.startsWith('https://');

    return (
        <>
            <DialogContent>
                <Box sx={{textAlign: 'center'}}>
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
                    <Button variant="contained" onClick={join}>{t('Join')}</Button>
                </Box>
            </DialogContent>
        </>
    );
}

export default ChannelInfo;
