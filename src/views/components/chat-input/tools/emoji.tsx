import React, {useState} from 'react';
import Box from '@mui/material/Box';
import EmojiPicker from 'components/emoji-picker';
import usePopover from 'hooks/use-popover';
import useToolStyle from 'views/components/chat-input/tools/style';
import EmoticonHappy from 'svg/emoticon-happy';

const Emoji = (props: { onSelect: (selected: string) => void }) => {
    const [, showPopover] = usePopover();
    const [hover, setHover] = useState<boolean>(false);
    const toolSx = useToolStyle();

    const emojiClicked = (event: React.MouseEvent<HTMLDivElement>) => {
        setHover(true);
        showPopover({
            body: <EmojiPicker onSelect={(emoji) => {
                setTimeout(() => {
                    props.onSelect(emoji)
                }, 200)
                showPopover(null);
            }}/>,
            anchorEl: event.currentTarget,
            onClose: () => {
                setHover(false);
            }
        });
    }

    return <Box sx={toolSx} onClick={emojiClicked} className={hover ? 'hover' : ''}>
        <EmoticonHappy height={20}/>
    </Box>;
}

export default Emoji;
