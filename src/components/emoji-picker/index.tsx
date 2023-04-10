import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const EmojiPicker = (props: { onSelect: (selected: string) => void }) => {
    return <Picker set="native" data={data} theme="dark" emojiSize={20} emojiButtonSize={30} autoFocus onEmojiSelect={(e: any) => {
        props.onSelect(e.native);
    }}/>;
}

export default EmojiPicker;
