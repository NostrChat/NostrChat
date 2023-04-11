import React, {useState} from 'react';
import Box from '@mui/material/Box';
import EmojiPicker from 'components/emoji-picker';
import usePopover from 'hooks/use-popover';
import useStyles from 'hooks/use-styles';
import EmoticonHappy from 'svg/emoticon-happy';

const Emoji = (props: { onSelect: (selected: string) => void }) => {
    const [, showPopover] = usePopover();
    const [hover, setHover] = useState<boolean>(false);
    const styles = useStyles();

    const emojiClicked = (event: React.MouseEvent<HTMLDivElement>) => {
        setHover(true);
        showPopover({
            body: <EmojiPicker onSelect={(emoji) => {
                setTimeout(() => {
                    props.onSelect(emoji);
                }, 200)
                showPopover(null);
                setHover(false);
            }}/>,
            anchorEl: event.currentTarget,
            onClose: () => {
                setHover(false);
            }
        });
    }

    return <Box sx={styles.chatInputToolSx} onClick={emojiClicked} className={hover ? 'hover' : ''}>
        <EmoticonHappy height={20}/>
    </Box>;
}

export default Emoji;
