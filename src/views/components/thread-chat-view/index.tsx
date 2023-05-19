import React, {useRef} from 'react';
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
import useStyles from 'hooks/use-styles';
import {threadRootAtom} from 'store';
import Close from 'svg/close';


const ThreadChatView = (props: { senderFn: (message: string) => Promise<any> }) => {
    const {isMd} = useMediaBreakPoint();
    const theme = useTheme();
    const styles = useStyles();
    const [t] = useTranslation();
    const [threadRoot, setThreadRoot] = useAtom(threadRootAtom);
    const ref = useRef<HTMLDivElement | null>(null);

    if (!threadRoot) return null;

    const scrollToBottom = () => {
        ref.current!.scroll({top: ref.current!.scrollHeight, behavior: 'auto'});
    }

    return <Box sx={{
        width: isMd ? `calc((100% - ${styles.sideBarWidth}) / 2)` : '100%',
        ...(() => isMd ? {} : {
            position: 'absolute',
            left: '0',
            top: '0',
            zIndex: 10
        })(),
        height: '100%',
        flexGrow: 0,
        flexShrink: 0,
        background: lighten(theme.palette.background.default, .03),
        display: 'flex',
        flexDirection: 'column'
    }}>
        <Box sx={{
            flexGrow: 0,
            flexShrink: 0,
        }}>
            <Box sx={{
                height: styles.headerHeight,
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
            <MessageView message={threadRoot} dateFormat='fromNow' compactView={false} inThreadView/>
            {(threadRoot.children && threadRoot.children.length > 0) && (<Divider textAlign="left" sx={{
                fontSize: '0.7em',
                color: darken(theme.palette.text.secondary, 0.4),
                m: '6px 0'
            }}>{t('{{n}} replies', {n: threadRoot.children.length})}</Divider>)}
        </Box>
        <Box ref={ref} sx={{
            flexGrow: 1,
            ...styles.scrollY,
        }}>
            {threadRoot.children?.map(msg => {
                return <MessageView key={msg.id} message={msg} dateFormat='fromNow' compactView={false} inThreadView/>
            })}
        </Box>
        <ChatInput separator={threadRoot.id} senderFn={(message: string, mentions: string[]) => {
            return props.senderFn(message).then(() => {
                setTimeout(() => {
                    scrollToBottom();
                }, 500);
            });
        }}/>
    </Box>
}


export default ThreadChatView;
