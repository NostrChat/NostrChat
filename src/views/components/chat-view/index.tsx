import React, {useEffect, useRef, useState} from 'react';
import {Box, darken} from '@mui/material';
import Divider from '@mui/material/Divider';
import {useTheme} from '@mui/material/styles';

import MessageView from 'views/components/message-view';
import {formatMessageDate, formatMessageTime} from 'helper';
import {Message} from 'types';

const ChatView = (props: { messages: Message[], separator: string }) => {
    const {separator, messages} = props;
    const theme = useTheme();
    const ref = useRef<HTMLDivElement | null>(null);
    const [isBottom, setIsBottom] = useState(true);

    const scrollToBottom = () => {
        ref.current!.scroll({top: ref.current!.scrollHeight, behavior: 'auto'});
    }

    useEffect(() => {
        if (ref.current && isBottom) {
            scrollToBottom();
        }
    }, [separator, messages]);

    useEffect(() => {
        let scrollTimer: any;
        const div = ref.current;

        const handleScroll = () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                const isBottom = Math.abs((div!.scrollHeight - div!.scrollTop) - div!.clientHeight) <= 5
                setIsBottom(isBottom);
            }, 50);
        }

        div?.addEventListener('scroll', handleScroll);
        return () => {
            div?.removeEventListener('scroll', handleScroll);
        }
    }, []);

    useEffect(() => {
        const imageLoaded = () => {
            if (ref.current && isBottom) {
                scrollToBottom();
            }
        }

        window.addEventListener('chat-media-loaded', imageLoaded);
        return () => {
            window.removeEventListener('chat-media-loaded', imageLoaded)
        }
    }, [isBottom]);

    return <Box ref={ref} sx={{
        overflowY: 'auto',
        overflowX: 'hidden',
        mt: 'auto'
    }}>
        {messages.map((msg, i) => {
            const prevMsg = messages[i - 1];
            const msgDate = formatMessageDate(msg.created);
            const prevMsgDate = prevMsg ? formatMessageDate(prevMsg.created) : null;
            const isCompact = prevMsg ? msg.creator === prevMsg?.creator && formatMessageTime(msg.created) === formatMessageTime(prevMsg.created) : false;

            if (msgDate !== prevMsgDate) {
                return <React.Fragment key={msg.id}>
                    <Divider
                        sx={{
                            m: '0 24px',
                            fontSize: '0.7em',
                            color: darken(theme.palette.text.secondary, 0.4),
                            mt: i === 0 ? '100px' : null
                        }}>{msgDate}</Divider>
                    <MessageView message={msg} compactView={isCompact}/>
                </React.Fragment>
            }

            return <MessageView key={msg.id} message={msg} compactView={isCompact}/>;
        })}
    </Box>;
}

export default ChatView;
