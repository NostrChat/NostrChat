import {useTheme} from '@mui/material/styles';

const useStyles = () => {
    const theme = useTheme();

    return {
        ellipsis: {
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
        },
        chatInputToolSx : {
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
        sideBarWidth: '270px',
        sideBarFooterHeight: '50px',
        headerHeight: '88px'
    }
}

export default useStyles;
