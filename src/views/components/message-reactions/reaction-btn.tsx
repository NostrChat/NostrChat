import {useState} from 'react';
import {useAtom} from 'jotai';
import Box from '@mui/material/Box';
import {blue} from '@mui/material/colors';
import {useTheme} from '@mui/material/styles';
import {ravenAtom} from 'atoms';
import {Message, ReactionCombined} from 'types';

const ReactionBtn = (props: { message: Message, r: ReactionCombined, mr: boolean }) => {
    const {message, r, mr} = props;
    const theme = useTheme();
    const [raven] = useAtom(ravenAtom);
    const [inProgress, setInProgress] = useState(false);

    return <Box key={r.symbol} sx={{
        fontSize: '0.8em',
        p: '0 6px',
        mr: mr ? '4px' : null,
        background: r.userReaction ? blue[800] : theme.palette.background.paper,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        border: '1px solid transparent',
        opacity: inProgress ? .6 : null,
        pointerEvents: inProgress ? 'none' : null,
        ':hover': {
            borderColor: theme.palette.divider,
        },
    }} onClick={() => {
        if (inProgress) return;
        setInProgress(true);
        (r.userReaction ? raven?.deleteEvents([r.userReaction.id]) : raven?.sendReaction(message.id, message.creator, r.symbol))?.finally(() => {
            setInProgress(false);
        });
    }}>
        <Box sx={{mr: '3px'}}>{r.symbol}</Box>
        <Box sx={{
            color: theme.palette.text.disabled,
            fontSize: '0.9em',
        }}>{r.count}</Box>
    </Box>
}

export default ReactionBtn;
