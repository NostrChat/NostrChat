import React, {useMemo, useRef} from 'react';
import {keysAtom, ravenAtom, threadRootAtom} from 'atoms';
import {useAtom} from 'jotai';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import {useTheme} from '@mui/material/styles';
import useContentRenderer from 'hooks/use-render-content';
import useToast from 'hooks/use-toast';
import usePopover from 'hooks/use-popover';
import useTranslation from 'hooks/use-translation';
import useModal from 'hooks/use-modal';
import ShortEmojiPicker from 'components/short-emoji-picker';
import CopyToClipboard from 'components/copy-clipboard';
import EmojiPicker from 'components/emoji-picker';
import ConfirmDialog from 'components/confirm-dialog';
import MessageReactions from 'views/components/message-reactions';
import {Message} from 'types';
import MessageReplyText from 'svg/message-reply-text';
import ContentCopy from 'svg/content-copy';
import EyeOff from 'svg/eye-off';
import Close from 'svg/close';


const MessageMobileView = (props: { message: Message, inThreadView?: boolean, onClose: () => void }) => {
    const {message, inThreadView, onClose} = props;
    const theme = useTheme();
    const renderer = useContentRenderer();
    const [raven] = useAtom(ravenAtom);
    const [keys] = useAtom(keysAtom);
    const [, setThreadRoot] = useAtom(threadRootAtom);
    const renderedBody = useMemo(() => renderer(message), [message]);
    const holderEl = useRef<HTMLDivElement | null>(null);
    const innerHolderEl = useRef<HTMLDivElement | null>(null);
    const fullEmojiPickerHolder = useRef<HTMLDivElement | null>(null);
    const [, showMessage] = useToast();
    const [, showPopover] = usePopover();
    const [, showModal] = useModal();
    const [t] = useTranslation();

    const emojiSelected = (emoji: string) => {
        raven?.sendReaction(message.id, message.creator, emoji).catch(e => {
            showMessage(e.toString(), 'error');
        });
    }

    const emojiFull = () => {
        showPopover({
            body: <Box sx={{width: '298px'}}>
                <EmojiPicker onSelect={emojiSelected}/>
            </Box>,
            anchorEl: fullEmojiPickerHolder.current!
        });
    }

    const openThread = () => {
        setThreadRoot(message);
        onClose();
    }

    const hide = () => {
        showModal({
            body: <ConfirmDialog onConfirm={() => {
                raven?.hideChannelMessage(message.id, '');
                onClose();
            }}/>
        });
    }

    const del = () => {
        showModal({
            body: <ConfirmDialog onConfirm={() => {
                raven?.deleteEvents([message.id]);
                onClose();
            }}/>
        });
    }

    const buttons = [<CopyToClipboard copy={message.content}>
        <MenuItem>
            <ListItemIcon>
                <ContentCopy height={18}/>
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{fontSize: '.9em'}}>{t('Copy')}</ListItemText>
        </MenuItem>
    </CopyToClipboard>];

    if (!inThreadView) {
        buttons.push(<MenuItem onClick={openThread}>
            <ListItemIcon>
                <MessageReplyText height={18}/>
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{fontSize: '.9em'}}>{t('Reply in thread')}</ListItemText>
        </MenuItem>);
    }

    if (keys?.pub !== message.creator && !('decrypted' in message)) { // only public messages
        buttons.push(<MenuItem onClick={hide}>
            <ListItemIcon>
                <EyeOff height={20}/>
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{fontSize: '.9em'}}>{t('Hide')}</ListItemText>
        </MenuItem>);
    }

    if (keys?.pub === message.creator) {
        buttons.push(<MenuItem onClick={del}>
            <ListItemIcon>
                <Close height={20}/>
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{fontSize: '.9em'}}>{t('Delete')}</ListItemText>
        </MenuItem>);
    }

    return <Box
        ref={holderEl}
        onClick={(e) => {
            e.stopPropagation();
            if (e.target === holderEl.current || e.target === innerHolderEl.current) {
                onClose();
            }
        }}
        sx={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 999,
            backdropFilter: 'blur(14px)',
            background: 'rgba(255, 255, 255, .1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none'
        }}>
        <Box ref={innerHolderEl} sx={{
            width: '90%',
        }}>
            <Box sx={{
                width: '280px',
                mb: '20px',
                borderRadius: '16px',
                background: theme.palette.background.paper
            }}>
                <ShortEmojiPicker onSelect={emojiSelected} onMore={emojiFull}/>
                <Box ref={fullEmojiPickerHolder}></Box>
            </Box>
            <Box sx={{
                background: theme.palette.background.paper,
                p: '12px',
                borderRadius: '6px'
            }}>
                <Box sx={{
                    fontSize: '0.9em',
                    mt: '4px',
                    wordBreak: 'break-word',
                    lineHeight: '1.4em',
                    color: theme.palette.text.secondary,
                    userSelect: 'text'
                }}>{renderedBody}</Box>
            </Box>
            {message.reactions && message.reactions.length > 0 && (
                <Box sx={{pt: '10px', display: 'inline-flex'}}>
                    <MessageReactions message={message}/>
                </Box>
            )}
            <Paper sx={{width: '320px', maxWidth: '100%', fontSize: '90%', mt: '10px'}}>
                <MenuList sx={{fontSize: '90%'}}>
                    {buttons.map((b, i) => <React.Fragment key={i}>{b}</React.Fragment>)}
                </MenuList>
            </Paper>
        </Box>
    </Box>;
}

export default MessageMobileView;