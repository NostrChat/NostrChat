import {MutableRefObject, useEffect} from 'react';
import Emoji from 'views/components/chat-input/tools/emoji';
import Gif from 'views/components/chat-input/tools/gif';
import {focusElem, insertText} from 'util/dom';

const Tools = (props: { inputRef: MutableRefObject<HTMLDivElement | null>, senderFn: (message: string) => void }) => {
    const {inputRef} = props;

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

    return <>
        <Emoji onSelect={(emoji) => {
            focusElem(inputRef.current!);
            insertText(emoji);
        }}/>
        <Gif onSelect={(gif) => {
            props.senderFn(gif);
        }}/>
    </>;
}

export default Tools;
