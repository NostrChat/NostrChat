import React from 'react';
import {useAtom} from 'jotai';
import Divider from '@mui/material/Divider';
import {darken, lighten} from '@mui/material';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

import MessageView from 'views/components/message-view';
import ChatInput from 'views/components/chat-input';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import useTranslation from 'hooks/use-translation';
import {threadRootAtom} from 'store';
import Close from 'svg/close';


const ThreadView = (props: { senderFn: (message: string) => void }) => {
    const [, isMd] = useMediaBreakPoint();
    const theme = useTheme();
    const [t] = useTranslation();
    const [threadRoot, setThreadRoot] = useAtom(threadRootAtom);
    const isSmallScreen = !isMd;

    if (!threadRoot) return null;

    return <Box sx={{
        width: isSmallScreen ? '100%' : 'calc((100% - 270px) / 2)',
        height: '100%',
        flexGrow: 0,
        flexShrink: 0,
        background: lighten(theme.palette.background.default, .03),
    }}>
        <Box sx={{
            height: '88px',
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
            alignItems: 'center',
            p: '0 20px'
        }}>
            <Box sx={{fontFamily: 'Faktum, sans-serif'}}>
                {t('Thread')}
            </Box>
            <IconButton onClick={() => {
                setThreadRoot(null)
            }}><Close height={20}/></IconButton>
        </Box>
        <MessageView message={threadRoot} compactView={false}/>
        <Divider textAlign="left" sx={{
            fontSize: '0.7em',
            color: darken(theme.palette.text.secondary, 0.4),
            m: '6px 0'
        }}>{t('{{n}} replies', {n: threadRoot.children?.length})}</Divider>
        {threadRoot.children?.map(msg => {
            return <MessageView key={msg.id} message={msg} compactView={false}/>
        })}
        <ChatInput separator={threadRoot.id} senderFn={props.senderFn}/>
    </Box>
}


export default ThreadView;
