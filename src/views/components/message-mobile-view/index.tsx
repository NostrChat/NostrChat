import React, {useMemo, useRef} from 'react';
import Box from '@mui/material/Box';
import {useAtom} from 'jotai';
import {useTheme} from '@mui/material/styles';
import useContentRenderer from 'hooks/use-render-content';
import ShortEmojiPicker from 'components/short-emoji-picker';
import EmojiPicker from 'components/emoji-picker';
import MessageReactions from 'views/components/message-reactions';
import useToast from 'hooks/use-toast';
import usePopover from 'hooks/use-popover';
import {Message} from 'types';
import {ravenAtom} from 'atoms';


const MessageMobileView = (props: { message: Message, onClose: () => void }) => {
    const {message, onClose} = props;
    const theme = useTheme();
    const renderer = useContentRenderer();
    const [raven] = useAtom(ravenAtom);
    const renderedBody = useMemo(() => renderer(message), [message]);
    const holderEl = useRef<HTMLDivElement | null>(null);
    const innerHolderEl = useRef<HTMLDivElement | null>(null);
    const fullEmojiPickerHolder  = useRef<HTMLDivElement | null>(null);
    const [, showMessage] = useToast();
    const [, showPopover] = usePopover();

    const emojiSelected = (emoji: string) => {
        raven?.sendReaction(message.id, message.creator, emoji).catch(e => {
            showMessage(e.toString(), 'error');
        });
    }

    const emojiFull = () => {
        showPopover({
            body: <Box sx={{width: '298px'}}>
                <EmojiPicker onSelect={emojiSelected}/>
            </Box>,
            anchorEl: fullEmojiPickerHolder.current!
        });
    }

    return <Box
        ref={holderEl}
        onClick={(e) => {
            e.stopPropagation();
            if (e.target === holderEl.current || e.target === innerHolderEl.current) {
                onClose();
            }
        }}
        sx={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 999,
            backdropFilter: 'blur(14px)',
            background: 'rgba(255, 255, 255, .1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none'
        }}>
        <Box ref={innerHolderEl} sx={{
            width: '90%',
        }}>
            <Box sx={{
                width: '280px',
                mb: '20px',
                borderRadius: '16px',
                background: theme.palette.background.paper
            }}>
                <ShortEmojiPicker onSelect={emojiSelected} onMore={emojiFull}/>
                <Box ref={fullEmojiPickerHolder}></Box>
            </Box>
            <Box sx={{
                background: theme.palette.background.paper,
                p: '12px',
                borderRadius: '6px'
            }}>
                <Box sx={{
                    fontSize: '0.9em',
                    mt: '4px',
                    wordBreak: 'break-word',
                    lineHeight: '1.4em',
                    color: theme.palette.text.secondary,
                    userSelect: 'text'
                }}>{renderedBody}</Box>
            </Box>
            <Box sx={{p: '6px 0'}}>
                <MessageReactions message={message}/>
            </Box>
        </Box>
    </Box>;
}

export default MessageMobileView;