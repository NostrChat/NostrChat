import React, {useEffect, useRef} from 'react';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import {lighten} from '@mui/material';
import Button from '@mui/material/Button';
import Tools from 'views/components/chat-input/tools';
import {focusElem} from 'util/dom';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import Send from 'svg/send';

const ChatInput = (props: { separator: string, senderFn: (message: string) => void }) => {
    const {senderFn, separator} = props;
    const theme = useTheme();
    const [, isMd] = useMediaBreakPoint();
    const inputRef = useRef<HTMLDivElement | null>(null);
    const storageKey = `${separator}_msg`;
    let saveTimer: any = null;

    useEffect(() => {
        inputRef.current!.innerText = localStorage.getItem(storageKey) || '';
        focusElem(inputRef.current!);
    }, [storageKey]);

    const save = () => {
        const val = inputRef.current!.innerText;
        if (val === '') {
            localStorage.removeItem(storageKey);
        }
        localStorage.setItem(storageKey, inputRef.current!.innerText);
    }

    const send = () => {
        const message = inputRef.current!.innerText.trim();
        if (!message) {
            return;
        }
        inputRef.current!.innerHTML = '';
        localStorage.removeItem(storageKey);
        senderFn(message);
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
            <Box contentEditable suppressContentEditableWarning ref={inputRef}
                 sx={{
                     p: '10px',
                     maxHeight: '200px',
                     overflowX: 'auto',
                     borderRadius: theme.shape.borderRadius,
                     outline: 'none',
                     color: theme.palette.text.secondary,
                     fontSize: '92%',
                     'b, strong': {
                         fontWeight: 'normal'
                     },
                     'i': {
                         fontStyle: 'normal'
                     }
                 }}
                 onInput={(e) => {
                     clearTimeout(saveTimer);
                     saveTimer = setTimeout(() => {
                         save();
                     }, 200);
                 }}
                 onKeyDown={(e) => {
                     if (!e.shiftKey && e.key === 'Enter') {
                         e.preventDefault();
                         send();
                     }
                 }}
            />
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
                    <Tools inputRef={inputRef} senderFn={props.senderFn}/>
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
