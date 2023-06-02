import React, {useEffect, useRef, useState} from 'react';
import {Box, darken} from '@mui/material';
import Divider from '@mui/material/Divider';
import {useTheme} from '@mui/material/styles';
import {useAtom} from 'jotai';

import MessageView from 'views/components/message-view';
import useStyles from 'hooks/use-styles';
import {formatMessageDate, formatMessageTime} from 'helper';
import {Message} from 'types';
import {SCROLL_DETECT_THRESHOLD} from 'const';
import {keysAtom, ravenAtom, readMarkMapAtom} from 'store';
import {notEmpty} from 'util/misc';

const ChatView = (props: { messages: Message[], separator: string, loading?: boolean }) => {
    const {separator, messages, loading} = props;
    const theme = useTheme();
    const styles = useStyles();
    const ref = useRef<HTMLDivElement | null>(null);
    const [isBottom, setIsBottom] = useState(true);
    const [firstMessageEl, setFirstMessageEl] = useState<HTMLDivElement | null>(null);
    const [scrollTop, setScrollTop] = useState<number>(0);
    const [raven] = useAtom(ravenAtom);
    const [keys] = useAtom(keysAtom);
    const [readMarkMap] = useAtom(readMarkMapAtom)

    const scrollToBottom = () => {
        ref.current!.scroll({top: ref.current!.scrollHeight, behavior: 'auto'});
    }

    useEffect(() => {
        if (ref.current && isBottom) {
            scrollToBottom();
        }
    }, [messages]);

    useEffect(() => {
        scrollToBottom();
    }, [separator]);

    useEffect(() => {
        if (isBottom) {
            if (readMarkMap[separator] === undefined) {
                const m = {...readMarkMap, ...{[separator]: Date.now()}};
            }
        }
    }, [separator, isBottom]);

    useEffect(() => {
        let scrollTimer: any;
        const div = ref.current;

        const handleScroll = () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                setScrollTop(div!.scrollTop);
                const isBottom = Math.abs((div!.scrollHeight - div!.scrollTop) - div!.clientHeight) <= SCROLL_DETECT_THRESHOLD
                setIsBottom(isBottom);
                const isTop = (div!.scrollHeight > div!.clientHeight) && div!.scrollTop < SCROLL_DETECT_THRESHOLD;
                if (isTop) {
                    window.dispatchEvent(new Event('chat-view-top', {bubbles: true}))
                }
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

    useEffect(() => {
        // After loading new messages, scrolls to the first one of them.
        if (loading) {
            setFirstMessageEl(ref.current!.querySelector('.message') as HTMLDivElement);
        } else {
            if (firstMessageEl) {
                if (firstMessageEl.previousSibling) {
                    (firstMessageEl.previousSibling as HTMLDivElement).scrollIntoView(true);
                }
                setFirstMessageEl(null);
            }
        }
    }, [loading]);

    useEffect(() => {
        // Listen messages visible in the screen for threads and reactions.
        const messageIds = Array.from(document.querySelectorAll('.message[data-visible=true]')).map(el => el.getAttribute('data-id')).filter(notEmpty);
        if (messageIds.length === 0) return;

        // Watching reactions' event ids to get updated if others users delete their reactions.
        // It's enough to watch reactions in last 10 minutes.
        // Otherwise, it can be impossible to get response from relays if there is a lot of reactions related to the message.
        const now = Math.floor(Date.now() / 1000)
        const relIds = messageIds.map(m => messages.find(x => x.id === m)?.reactions?.filter(x => x.creator !== keys?.pub).filter(l => now - l.created <= 600).map(l => l.id) || []).flat();

        let interval: any;
        const timer = setTimeout(() => {
            raven?.listenMessages(messageIds, relIds);
            interval = setInterval(() => {
                raven?.listenMessages(messageIds, relIds);
            }, 10000);
        }, 500);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        }
    }, [raven, messages, scrollTop]);

    return <Box ref={ref} sx={{
        mt: 'auto',
        ...styles.scrollY,
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
                    <MessageView message={msg} dateFormat='time' compactView={isCompact}/>
                </React.Fragment>
            }

            return <MessageView key={msg.id} message={msg} dateFormat='time' compactView={isCompact}/>;
        })}
    </Box>;
}

export default ChatView;
