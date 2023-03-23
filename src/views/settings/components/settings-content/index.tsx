import React from 'react';
import Box from '@mui/material/Box';

const SettingsContent = (props: { children: React.ReactNode }) => {
    return <Box sx={{m: '20px 20px 0 20px'}}>
        {props.children}
    </Box>
}

export default SettingsContent;
