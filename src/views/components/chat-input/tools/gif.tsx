import React from 'react';
import Box from '@mui/material/Box';
import GifPicker from 'components/gif-picker';
import usePopover from 'hooks/use-popover';
import useToolStyle from 'views/components/chat-input/tools/style';
import GifIcon from 'svg/gif';

const Gif = (props: { onSelect: (selected: string) => void }) => {
    const [, showPopover] = usePopover();
    const toolSx = useToolStyle();

    const emojiClicked = (event: React.MouseEvent<HTMLDivElement>) => {
        showPopover({
            body: <GifPicker onSelect={(gif) => {
                setTimeout(() => {
                    props.onSelect(gif);
                }, 200)
                showPopover(null);
            }}/>,
            anchorEl: event.currentTarget
        });
    }

    return <Box onClick={emojiClicked} sx={toolSx}>
        <GifIcon height={20}/>
    </Box>;
}

export default Gif;
