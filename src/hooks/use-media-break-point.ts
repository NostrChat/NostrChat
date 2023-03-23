import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const useMediaBreakPoint = (): [boolean, boolean] => {
    const theme = useTheme();
    const isSm = useMediaQuery(theme.breakpoints.up('sm'));
    const isMd = useMediaQuery(theme.breakpoints.up('md'));
    return [isSm, isMd];
}

export default useMediaBreakPoint;