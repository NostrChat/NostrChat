import {useTheme} from '@mui/material/styles';

const useToolStyle = () => {
    const theme = useTheme();

    return {
        display: 'flex',
        alignItems: 'center',
        padding: '6px',
        cursor: 'pointer',
        mr: '6px',
        borderRadius: theme.shape.borderRadius,
        ':hover': {
            background: theme.palette.divider,
        }
    };
}

export default useToolStyle;
