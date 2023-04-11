import {useAtom} from 'jotai';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import Avatar from 'views/components/avatar';
import AppContentHeaderBase from 'views/components/app-content-header-base';
import Menu from 'views/direct-message/components/dm-header/menu';
import useStyle from 'hooks/use-styles';
import {directMessageAtom, profilesAtom} from 'store';

const DmHeader = () => {
    const theme = useTheme();
    const [directMessage,] = useAtom(directMessageAtom);
    const [profiles] = useAtom(profilesAtom);
    const styles = useStyle();

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
            <Avatar src={profile?.picture} seed={directMessage} size={50} />
        </Box>
        <Box sx={{flexGrow: 1, minWidth: 0}}>
            <Box sx={{
                fontFamily: 'Faktum, sans-serif',
                ...styles.ellipsis
            }}>
                {profile?.name}
            </Box>
            {profile?.about && (
                <Box sx={{
                    color: theme.palette.primary.dark,
                    fontSize: '96%',
                    ...styles.ellipsis
                }}>
                    {profile.about}
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
            <Menu pubkey={directMessage}/>
        </Box>
    </AppContentHeaderBase>;
}

export default DmHeader;
