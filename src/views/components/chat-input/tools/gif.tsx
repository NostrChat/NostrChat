import React from 'react';
import Box from '@mui/material/Box';
import GifPicker from 'components/gif-picker';
import usePopover from 'hooks/use-popover';
import GifIcon from 'svg/gif';

const Gif = (props: { onSelect: (selected: string) => void }) => {
    const [, showPopover] = usePopover();

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

    return <Box onClick={emojiClicked} sx={{
        display: 'inline-flex',
        alignItems: 'center'
    }}>
        <GifIcon height={20}/>
    </Box>;
}

export default Gif;
