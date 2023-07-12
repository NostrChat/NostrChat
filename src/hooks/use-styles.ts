import {useTheme} from '@mui/material/styles';
import {SxProps} from '@mui/material';

const useStyles = () => {
    const theme = useTheme();

    return {
        withHover: (sx: SxProps) => {
            return {'@media (hover: hover)': {...sx}}
        },
        ellipsis: {
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
        },
        chatInputToolSx: {
            display: 'flex',
            alignItems: 'center',
            padding: '6px',
            cursor: 'pointer',
            mr: '6px',
            borderRadius: theme.shape.borderRadius,
            ':hover,&.hover': {
                background: theme.palette.divider,
            }
        },
        scrollY: {
            overflowY: 'auto',
            overflowX: 'hidden'
        },
        sideBarWidth: '270px',
        sideBarFooterHeight: '50px',
        headerHeight: '88px'
    }
}

export default useStyles;
