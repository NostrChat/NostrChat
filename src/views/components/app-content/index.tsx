import React from 'react';
import Box from '@mui/material/Box';
import useMediaBreakPoint from 'hooks/use-media-break-point';

const AppContent = (props: { children: React.ReactNode, divide?: boolean }) => {
    const {isMd} = useMediaBreakPoint();

    const isSmallScreen = !isMd;

    return <Box sx={{
        width: isSmallScreen ? '100%' : (props.divide ? 'calc((100% - 270px) / 2)' : 'calc(100% - 270px)'),
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 0,
        flexShrink: 0
    }}>
        {props.children}
    </Box>
}

export default AppContent;
