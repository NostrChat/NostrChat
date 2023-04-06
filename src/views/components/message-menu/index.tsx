import React from 'react';
import {Message} from 'types';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import {useTheme} from '@mui/material/styles';
import {useAtom} from 'jotai';
import {keysAtom, ravenAtom, replyingToAtom} from 'store';
import useModal from 'hooks/use-modal';
import ConfirmDialog from 'components/confirm-dialog';
import useTranslation from 'hooks/use-translation';
import EyeOff from 'svg/eye-off';
import Reply from 'svg/reply';

const MessageMenu = (props: { message: Message }) => {
    const {message} = props;
    const theme = useTheme();
    const [keys] = useAtom(keysAtom);
    const [raven] = useAtom(ravenAtom);
    const [, setReplyingToAtom] = useAtom(replyingToAtom);
    const [, showModal] = useModal();
    const [t] = useTranslation();

    const hide = () => {
        showModal({
            body: <ConfirmDialog onConfirm={() => {
                raven?.hideChannelMessage(message.id, '');
            }}/>
        });
    }

    const reply = () => {
        setReplyingToAtom(message);
    }

    const buttons = [<Tooltip title={t('Reply')}>
        <IconButton size="small" onClick={reply}>
            <Reply height={20}/>
        </IconButton>
    </Tooltip>];

    if (keys?.pub !== message.creator && !('decrypted' in message)) { // only public messages
        buttons.push(<Tooltip title={t('Hide')}>
            <IconButton size="small" onClick={hide}>
                <EyeOff height={20}/>
            </IconButton>
        </Tooltip>);
    }

    if (buttons.length === 0) return null;

    return <Box sx={{
        padding: '6px',
        borderRadius: theme.shape.borderRadius,
        background: theme.palette.background.paper,
        display: 'flex'
    }}>
        {buttons.map((b, i) => <Box sx={{mr: i === buttons.length - 1 ? null : '4px'}} key={i}>{b}</Box>)}
    </Box>;
}

export default MessageMenu;
