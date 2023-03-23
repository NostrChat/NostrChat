import {useAtom} from 'jotai';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import Avatar from 'views/components/avatar';
import {directMessageAtom, profilesAtom} from 'store';

const DmHeader = () => {
    const theme = useTheme();
    const [directMessage,] = useAtom(directMessageAtom);
    const [profiles] = useAtom(profilesAtom);

    if (!directMessage) {
        return null;
    }

    const profile = profiles.find(x => x.creator === directMessage);

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
            <Box sx={{
                display: 'flex',
                mr: '10px'
            }}>
                <Avatar src={profile?.picture} seed={directMessage} size={50} type="user"/>
            </Box>
            <Box sx={{width: 'calc(100% - 110px)'}}>
                <Box sx={{
                    fontFamily: 'Faktum, sans-serif',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis'
                }}>
                    {profile?.name}
                </Box>
                {profile?.about && (
                    <Box sx={{
                        color: theme.palette.primary.dark,
                        fontSize: '96%',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis'
                    }}>
                        {profile.about}
                    </Box>
                )}
            </Box>
        </Box>
    </Box>


}

export default DmHeader;
