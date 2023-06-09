import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import {useTheme} from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Brightness6 from 'svg/brightness-6';
import useTranslation from 'hooks/use-translation';
import useAppTheme from 'hooks/use-app-theme';

const ThemeSwitch = () => {
    const theme = useTheme();
    const [t] = useTranslation();
    const [, toggleTheme] = useAppTheme();

    return <Box sx={{
        display: 'flex',
        mt: '-5px',
        color: theme.palette.text.disabled,
    }}>
        <Tooltip title={t('Toggle theme')}>
            <IconButton size="small" sx={{color: 'text.secondary'}} onClick={toggleTheme}>
                <Brightness6 height={20}/>
            </IconButton>
        </Tooltip>
    </Box>;
}

export default ThemeSwitch;
