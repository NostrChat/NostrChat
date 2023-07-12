import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import {PLATFORM} from 'const';

const EmojiPicker = (props: { onSelect: (selected: string) => void }) => {
    return <Picker set="native" data={data} theme="dark" emojiSize={20} emojiButtonSize={30} autoFocus={PLATFORM === 'web'} onEmojiSelect={(e: any) => {
        props.onSelect(e.native);
    }}/>;
}

export default EmojiPicker;
