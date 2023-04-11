import React, {useState} from 'react';
import Box from '@mui/material/Box';
import GifPicker from 'components/gif-picker';
import usePopover from 'hooks/use-popover';
import useStyles from 'hooks/use-styles';
import GifIcon from 'svg/gif';

const Gif = (props: { onSelect: (selected: string) => void }) => {
    const [, showPopover] = usePopover();
    const [hover, setHover] = useState<boolean>(false);
    const styles = useStyles();

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

    return <Box onClick={emojiClicked} sx={styles.chatInputToolSx} className={hover ? 'hover' : ''}>
        <GifIcon height={20}/>
    </Box>;
}

export default Gif;
