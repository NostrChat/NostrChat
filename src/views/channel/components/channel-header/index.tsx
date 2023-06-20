import {useAtom} from 'jotai';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import ChannelMenu from 'views/channel/components/channel-header/channel-menu';
import AppContentHeaderBase from 'views/components/app-content-header-base';
import useStyle from 'hooks/use-styles';
import {channelAtom, keysAtom} from 'atoms';


const ChannelHeader = () => {
    const [keys] = useAtom(keysAtom);
    const [channel] = useAtom(channelAtom);
    const theme = useTheme();
    const styles = useStyle();

    if (!channel || !keys) {
        return null;
    }

    const hasPicture = channel.picture.startsWith('https://');

    return <AppContentHeaderBase>
        {hasPicture && (
            <Box sx={{
                display: 'flex',
                mr: '10px',
                flexShrink: 0
            }}>
                <Box component="img" sx={{
                    width: '50px',
                    height: '50px',
                    borderRadius: theme.shape.borderRadius
                }} src={channel.picture} alt={channel.name}/>
            </Box>
        )}
        <Box sx={{flexGrow: 1, minWidth: 0}}>
            <Box sx={{
                fontFamily: 'Faktum, sans-serif',
                ...styles.ellipsis
            }}>
                {channel.name}
            </Box>
            {channel.about && (
                <Box sx={{
                    color: theme.palette.primary.dark,
                    fontSize: '96%',
                    ...styles.ellipsis
                }}>
                    {channel.about}
                </Box>
            )}
        </Box>
        <Box sx={{
            width: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        }}>
            <ChannelMenu/>
        </Box>
    </AppContentHeaderBase>
}

export default ChannelHeader;
