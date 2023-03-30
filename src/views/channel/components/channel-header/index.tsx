import {useAtom} from 'jotai';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ChannelMenu from 'views/channel/components/channel-header/channel-menu';
import {appMenuAtom, channelAtom, keysAtom} from 'store';
import {GLOBAL_CHAT} from 'const';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import ChevronLeft from 'svg/chevron-left';
import ChevronRight from 'svg/chevron-right';

const ChannelHeader = () => {
    const [keys] = useAtom(keysAtom);
    const [channel] = useAtom(channelAtom);
    const theme = useTheme();
    const [appMenu, setAppMenu] = useAtom(appMenuAtom);
    const [, isMd] = useMediaBreakPoint();

    if (!channel || !keys) {
        return null;
    }

    const canEdit = keys.pub === channel.creator && channel.id !== GLOBAL_CHAT.id;
    const hasPicture = channel.picture.startsWith('https://');
    const isSmallScreen = !isMd;

    return <Box>
        <Box sx={{
            height: '88px',
            display: 'flex',
            flexGrow: 0,
            flexShrink: 0,
            borderBottom: `1px solid ${theme.palette.divider}`,
            alignItems: 'center',
            pl: isSmallScreen ? '5px' : '20px'
        }}>
            {isSmallScreen && (
                <Box
                    sx={{
                        width: '40px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: '6px',
                    }}
                    onClick={() => {
                        setAppMenu(!appMenu)
                    }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '12px',
                        width: '36px',
                        height: '36px',
                        background: theme.palette.divider,
                    }}>
                        <IconButton>
                            {appMenu ? <ChevronRight height={24}/> : <ChevronLeft height={24}/>}
                        </IconButton>
                    </Box>
                </Box>
            )}
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
            {canEdit && (<Box sx={{
                width: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                <ChannelMenu/>
            </Box>)}
        </Box>
    </Box>
}

export default ChannelHeader;
