import {useAtom} from 'jotai';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import Avatar from 'views/components/avatar';
import AppContentHeaderBase from 'views/components/app-content-header-base';
import {directMessageAtom, profilesAtom} from 'store';

const DmHeader = () => {
    const theme = useTheme();
    const [directMessage,] = useAtom(directMessageAtom);
    const [profiles] = useAtom(profilesAtom);

    if (!directMessage) {
        return null;
    }

    const profile = profiles.find(x => x.creator === directMessage);

    return <AppContentHeaderBase>
        <Box sx={{
            display: 'flex',
            mr: '10px',
            flexShrink: 0
        }}>
            <Avatar src={profile?.picture} seed={directMessage} size={50} type="user"/>
        </Box>
        <Box sx={{flexGrow: 1, minWidth: 0}}>
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
    </AppContentHeaderBase>;
}

export default DmHeader;
