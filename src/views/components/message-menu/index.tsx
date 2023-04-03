import React from 'react';
import {Message} from 'types';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import {useTheme} from '@mui/material/styles';
import EyeOff from 'svg/eye-off';
import {useAtom} from 'jotai';
import {keysAtom, ravenAtom} from 'store';
import useModal from 'hooks/use-modal';
import ReasonDialog from 'views/components/dialogs/reason-dialog';
import useTranslation from 'hooks/use-translation';

const MessageMenu = (props: { message: Message }) => {
    const {message} = props;
    const theme = useTheme();
    const [keys] = useAtom(keysAtom);
    const [raven] = useAtom(ravenAtom);
    const [, showModal] = useModal();
    const [t] = useTranslation();

    const buttons = [];

    const hide = () => {
        showModal({
            body: <ReasonDialog title={t('Hide Message')} onConfirm={(reason) => {
                raven?.hideMessage(message.id, reason);
            }}/>
        });
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
        padding: '6px',
        borderRadius: theme.shape.borderRadius,
        background: theme.palette.background.paper
    }}>
        {buttons.map((b, i) => <React.Fragment key={i}>{b}</React.Fragment>)}
    </Box>;
}

export default MessageMenu;