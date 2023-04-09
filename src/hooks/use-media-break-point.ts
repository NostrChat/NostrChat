import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const useMediaBreakPoint = (): {isSm: boolean, isMd: boolean, isLg: boolean, isXl: boolean} => {
    const theme = useTheme();
    const isSm = useMediaQuery(theme.breakpoints.up('sm'));
    const isMd = useMediaQuery(theme.breakpoints.up('md'));
    const isLg = useMediaQuery(theme.breakpoints.up('lg'));
    const isXl = useMediaQuery(theme.breakpoints.up('xl'));
    return {isSm, isMd, isLg, isXl};
}

export default useMediaBreakPoint;
