import React from 'react';
import {Message} from 'types';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import {useTheme} from '@mui/material/styles';
import {useAtom} from 'jotai';
import {keysAtom, ravenAtom, threadRootAtom} from 'store';
import useModal from 'hooks/use-modal';
import ConfirmDialog from 'components/confirm-dialog';
import useTranslation from 'hooks/use-translation';
import EyeOff from 'svg/eye-off';
import MessageReplyText from 'svg/message-reply-text';

const MessageMenu = (props: { message: Message, inThreadView?: boolean }) => {
    const {message, inThreadView} = props;
    const theme = useTheme();
    const [keys] = useAtom(keysAtom);
    const [raven] = useAtom(ravenAtom);
    const [, setThreadRoot] = useAtom(threadRootAtom);
    const [, showModal] = useModal();
    const [t] = useTranslation();

    const openThread = () => {
        setThreadRoot(message);
    }

    const hide = () => {
        showModal({
            body: <ConfirmDialog onConfirm={() => {
                raven?.hideChannelMessage(message.id, '');
            }}/>
        });
    }

    const buttons = [];

    if (!inThreadView) {
        buttons.push(<Tooltip title={t('Reply in thread')}>
            <IconButton size="small" onClick={openThread}>
                <MessageReplyText height={18}/>
            </IconButton>
        </Tooltip>)
    }

    if (keys?.pub !== message.creator && !('decrypted' in message)) { // only public messages
        buttons.push(<Tooltip title={t('Hide')}>
            <IconButton size="small" onClick={hide}>
                <EyeOff height={20}/>
            </IconButton>
        </Tooltip>);
    }

    if (buttons.length === 0) return null;

    return <Box sx={{
        padding: '4px 6px',
        borderRadius: theme.shape.borderRadius,
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
    }}>
        {buttons.map((b, i) => <Box
            sx={{display: 'flex', alignItems: 'center', mr: i === buttons.length - 1 ? null : '6px'}}
            key={i}>{b}</Box>)}
    </Box>;
}

export default MessageMenu;
