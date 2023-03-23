import React from 'react';
import Box from '@mui/material/Box';

const AppWrapper = (props: { children: React.ReactNode }) => {
    return <Box sx={{
        flexGrow: 1,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
    }}>
        {props.children}
    </Box>
}

export default AppWrapper;
