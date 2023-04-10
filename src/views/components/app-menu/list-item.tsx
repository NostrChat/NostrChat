import React from 'react';
import {useNavigate} from '@reach/router';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';

const ListItem = (props: { label: React.ReactNode, href: string, selected: boolean }) => {
    const navigate = useNavigate();
    const theme = useTheme();

    return <Box component="a" href={props.href} onClick={(e) => {
        e.preventDefault();
        navigate(props.href).then();
    }} sx={{
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '15px',
        position: 'relative',
        zIndex: 0,
        color: theme.palette.text.primary,
        textDecoration: 'none',
        pl: '10px',
        ':before': {
            content: "''",
            position: 'absolute',
            top: '12px',
            left: '0',
            width: '4px',
            height: '16px',
            borderRadius:  theme.shape.borderRadius,
            background: theme.palette.primary.main,
            display: props.selected ? null : 'none'
        },
        ':hover': {
            ':before': {display: 'inline-block'}
        }
    }}>
        <Box sx={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
        }}>{props.label}</Box>
    </Box>;
}

export default ListItem;
