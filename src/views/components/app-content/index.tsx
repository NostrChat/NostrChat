import React from 'react';
import Box from '@mui/material/Box';
import useMediaBreakPoint from 'hooks/use-media-break-point';

const AppContent = (props: { children: React.ReactNode }) => {
    const [, isMd] = useMediaBreakPoint();

    const isSmallScreen = !isMd;

    return <Box sx={{
        width: isSmallScreen ? '100%' : 'calc(100% - 270px)',
        display: 'flex',
        flexDirection: 'column'
    }}>
        {props.children}
    </Box>
}

export default AppContent;
