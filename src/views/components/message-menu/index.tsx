import React from 'react';
import {Message} from 'types';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import {useTheme} from '@mui/material/styles';
import {useAtom} from 'jotai';
import {activeMessageAtom, keysAtom, ravenAtom, threadRootAtom} from 'store';
import useModal from 'hooks/use-modal';
import ConfirmDialog from 'components/confirm-dialog';
import EmojiPicker from 'components/emoji-picker';
import useTranslation from 'hooks/use-translation';
import usePopover from 'hooks/use-popover';
import useToast from 'hooks/use-toast';
import EyeOff from 'svg/eye-off';
import MessageReplyText from 'svg/message-reply-text';
import Emoticon from 'svg/emoticon';

const MessageMenu = (props: { message: Message, inThreadView?: boolean }) => {
    const {message, inThreadView} = props;
    const theme = useTheme();
    const [keys] = useAtom(keysAtom);
    const [raven] = useAtom(ravenAtom);
    const [, setActiveMessage] = useAtom(activeMessageAtom);
    const [, setThreadRoot] = useAtom(threadRootAtom);
    const [, showMessage] = useToast();
    const [, showModal] = useModal();
    const [t] = useTranslation();
    const [, showPopover] = usePopover();

    const emoji = (event: React.MouseEvent<HTMLButtonElement>) => {
        setActiveMessage(message.id);
        showPopover({
            body: <Box sx={{width: '298px'}}>
                <EmojiPicker onSelect={(emoji) => {
                    raven?.sendReaction(message.id, message.creator, emoji).catch(e => {
                        showMessage(e, 'error');
                    });
                    setActiveMessage(null);
                    showPopover(null);
                }}/>
            </Box>,
            toRight: true,
            toBottom: true,
            anchorEl: event.currentTarget,
            onClose: () => {
                setActiveMessage(message.id);
                setActiveMessage(null);
            }
        });
    }

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

    const buttons = [<Tooltip title={t('Reaction')}>
            <IconButton size="small" onClick={emoji}>
                <Emoticon height={20}/>
            </IconButton>
        </Tooltip>];

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
