import React from 'react';
import Box from '@mui/material/Box';
import EmojiPicker from 'components/emoji-picker';
import usePopover from 'hooks/use-popover';
import useToolStyle from 'views/components/chat-input/tools/style';
import EmoticonHappy from 'svg/emoticon-happy';

const Emoji = (props: { onSelect: (selected: string) => void }) => {
    const [, showPopover] = usePopover();
    const toolSx = useToolStyle();

    const emojiClicked = (event: React.MouseEvent<HTMLDivElement>) => {
        showPopover({
            body: <EmojiPicker onSelect={(emoji) => {
                setTimeout(() => {
                    props.onSelect(emoji)
                }, 200)
                showPopover(null);
            }}/>,
            anchorEl: event.currentTarget
        });
    }

    return <Box sx={toolSx} onClick={emojiClicked}>
        <EmoticonHappy height={20}/>
    </Box>;
}

export default Emoji;
