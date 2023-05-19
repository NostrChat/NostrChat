import React, {useEffect, useRef} from 'react';
import {EditorContent} from '@tiptap/react'
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import {lighten} from '@mui/material';
import Button from '@mui/material/Button';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import Tools from 'views/components/chat-input/tools';
import useMakeEditor from 'views/components/chat-input/editor';
import Send from 'svg/send';


const ChatInput = (props: { separator: string, senderFn: (message: string) => Promise<any> }) => {
    const {senderFn, separator} = props;
    const theme = useTheme();
    const {isMd} = useMediaBreakPoint();
    const inputRef = useRef<HTMLDivElement | null>(null);
    const storageKey = `${separator}_msg`;

    const save = () => {
        const val = editor?.getText();
        if (!val) {
            localStorage.removeItem(storageKey);
            return;
        }
        localStorage.setItem(storageKey, val);
    }

    const editor = useMakeEditor({content: localStorage.getItem(storageKey) || '', onUpdate: save});

    useEffect(() => {
        editor?.commands.setContent(localStorage.getItem(storageKey) || '');
        editor?.commands.focus();
    }, [storageKey]);

    const send = () => {
        const message = editor?.getText();
        if (!message) return;
        editor?.commands.setContent('');
        localStorage.removeItem(storageKey);
        return senderFn(message);
    }

    const insert = (text: string) => {
        editor?.commands.insertContent(text);
        editor?.commands.focus();
    }

    return <Box sx={{
        height: 'auto',
        minHeight: '120px',
        p: `10px 10px 14px ${isMd ? '20px' : '10px'}`,
        flexGrow: 0,
        flexShrink: 0,
    }}>
        <Box sx={{
            background: theme.palette.divider,
            borderRadius: theme.shape.borderRadius,
        }}>
            <Box sx={{p: '1px 10px'}}>
                <EditorContent
                    editor={editor}
                    onKeyDown={(e) => {

                        if (!e.shiftKey && e.key === 'Enter') {
                            send();
                        }
                    }}/>
            </Box>
            <Box sx={{
                borderTop: `1px solid ${lighten(theme.palette.divider, 0.6)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px',
                height: '60px',
            }}>
                <Box sx={{
                    pl: '12px',
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <Tools inputRef={inputRef} senderFn={props.senderFn} insertFn={insert}/>
                </Box>
                <Button variant="contained" size="small" color="primary" sx={{
                    minWidth: 'auto',
                    width: '28px',
                    height: '28px',
                    padding: '6px',
                    borderRadius: '10px'
                }} onClick={send}><Send height={32}/></Button>
            </Box>
        </Box>
    </Box>;
}

export default ChatInput;
