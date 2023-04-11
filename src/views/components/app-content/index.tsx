import React from 'react';
import Box from '@mui/material/Box';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import useStyles from 'hooks/use-styles';

const AppContent = (props: { children: React.ReactNode, divide?: boolean }) => {
    const {isMd} = useMediaBreakPoint();
    const styles = useStyles();

    const isSmallScreen = !isMd;

    return <Box sx={{
        width: isSmallScreen ? '100%' : (props.divide ? `calc((100% - ${styles.sideBarWidth}) / 2)` : `calc(100% - ${styles.sideBarWidth})`),
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
