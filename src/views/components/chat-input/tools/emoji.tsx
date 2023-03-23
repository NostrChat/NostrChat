import React from 'react';
import Box from '@mui/material/Box';
import EmojiPicker from 'components/emoji-picker';
import usePopover from 'hooks/use-popover';
import EmoticonHappy from 'svg/emoticon-happy';

const Emoji = (props: { onSelect: (selected: string) => void }) => {
    const [, showPopover] = usePopover();

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

    return <Box sx={{
        display: 'inline-flex',
        alignItems: 'center'
    }} onClick={emojiClicked}>
        <EmoticonHappy height={20}/>
    </Box>;
}

export default Emoji;
