import {MutableRefObject, useEffect} from 'react';
import Emoji from 'views/components/chat-input/tools/emoji';
import Gif from 'views/components/chat-input/tools/gif';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import {focusElem, insertText} from 'util/dom';

const Tools = (props: { inputRef: MutableRefObject<HTMLDivElement | null>, senderFn: (message: string) => void }) => {
    const {inputRef} = props;
    const theme = useTheme();

    useEffect(() => {
        const onPaste = (e: ClipboardEvent) => {
            e.preventDefault();
            insertText(e.clipboardData!.getData('text/plain'));
        }

        const onDrop = (e: DragEvent) => {
            e.preventDefault();
        }

        const input = inputRef.current;

        input?.addEventListener('paste', onPaste);
        input?.addEventListener('drop', onDrop);
        return () => {
            input?.removeEventListener('paste', onPaste);
            input?.removeEventListener('drop', onDrop);
        }
    }, []);

    const toolSx = {
        display: 'flex',
        alignItems: 'center',
        padding: '6px',
        cursor: 'pointer',
        mr: '6px',
        borderRadius: theme.shape.borderRadius,
        ':hover': {
            background: theme.palette.divider,
        }
    };

    return <>
        <Box sx={toolSx}>
            <Emoji onSelect={(emoji) => {
                focusElem(inputRef.current!);
                insertText(emoji);
            }}/>
        </Box>

        <Box sx={toolSx}>
            <Gif onSelect={(gif) => {
                props.senderFn(gif);
            }}/>
        </Box>
    </>;
}

export default Tools;
