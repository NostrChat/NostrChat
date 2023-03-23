import {useAtom} from 'jotai';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import ChannelMenu from 'views/channel/components/channel-header/channel-menu';
import {channelAtom, keysAtom} from 'store';
import {GLOBAL_CHAT} from 'const';

const ChannelHeader = () => {
    const [keys] = useAtom(keysAtom);
    const [channel] = useAtom(channelAtom);
    const theme = useTheme();

    if (!channel || !keys) {
        return null;
    }

    const canEdit = keys.pub === channel.creator && channel.id !== GLOBAL_CHAT.id;
    const hasPicture = channel.picture.startsWith('https://');

    return <Box>
        <Box sx={{
            height: '88px',
            display: 'flex',
            flexGrow: 0,
            flexShrink: 0,
            borderBottom: `1px solid ${theme.palette.divider}`,
            alignItems: 'center',
            pl: '20px'
        }}>
            {hasPicture && (
                <Box sx={{
                    display: 'flex',
                    mr: '10px'
                }}>
                    <Box component="img" sx={{
                        width: '50px',
                        height: '50px',
                        borderRadius: theme.shape.borderRadius
                    }} src={channel.picture} alt={channel.name}/>
                </Box>
            )}
            <Box sx={{width: `calc(100% - ${hasPicture ? '110px' : '50px'})`}}>
                <Box sx={{
                    fontFamily: 'Faktum, sans-serif',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis'
                }}>
                    {channel.name}
                </Box>
                {channel.about && (
                    <Box sx={{
                        color: theme.palette.primary.dark,
                        fontSize: '96%',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis'
                    }}>
                        {channel.about}
                    </Box>
                )}
            </Box>
            {canEdit && (<Box sx={{width: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <ChannelMenu/>
            </Box>)}
        </Box>
    </Box>
}

export default ChannelHeader;
