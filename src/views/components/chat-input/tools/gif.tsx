import React, {useState} from 'react';
import Box from '@mui/material/Box';
import GifPicker from 'components/gif-picker';
import usePopover from 'hooks/use-popover';
import useToolStyle from 'views/components/chat-input/tools/style';
import GifIcon from 'svg/gif';

const Gif = (props: { onSelect: (selected: string) => void }) => {
    const [, showPopover] = usePopover();
    const [hover, setHover] = useState<boolean>(false);
    const toolSx = useToolStyle();

    const emojiClicked = (event: React.MouseEvent<HTMLDivElement>) => {
        setHover(true);
        showPopover({
            body: <GifPicker onSelect={(gif) => {
                setTimeout(() => {
                    props.onSelect(gif);
                }, 200)
                showPopover(null);
            }}/>,
            anchorEl: event.currentTarget,
            onClose: () => {
                setHover(false);
            }
        });
    }

    return <Box onClick={emojiClicked} sx={toolSx} className={hover ? 'hover' : ''}>
        <GifIcon height={20}/>
    </Box>;
}

export default Gif;
