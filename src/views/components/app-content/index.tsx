import React from 'react';
import {useAtom} from 'jotai';
import Box from '@mui/material/Box';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import {appMenuAtom} from 'store';

const AppContent = (props: { children: React.ReactNode }) => {
    const [, isMd] = useMediaBreakPoint();
    const [appMenu] = useAtom(appMenuAtom);

    return <Box sx={{
        width: `calc(100% - ${isMd ? '270px' : '26px'})`,
        display: (!isMd && appMenu) ? 'none' : 'flex',
        flexDirection: 'column'
    }}>
        {props.children}
    </Box>
}

export default AppContent;
