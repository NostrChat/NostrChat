import {Message, Reaction} from 'types';
import {useMemo} from 'react';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import {blue} from '@mui/material/colors';
import uniq from 'lodash.uniq';
import {useAtom} from 'jotai';
import {keysAtom, ravenAtom} from 'store';

const MessageReactions = (props: { message: Message }) => {
    const {message} = props;
    const theme = useTheme();
    const [keys] = useAtom(keysAtom);
    const [raven] = useAtom(ravenAtom);

    const reactions: {
        symbol: string,
        authors: string[],
        count: number,
        userReaction: Reaction | undefined
    }[] | null = useMemo(() => {
        if (!message.reactions) return null;

        const symbols: Record<string, number> = {};
        message.reactions.sort((a, b) => a.created - b.created).forEach(r => {
            symbols[r.content] = 1;
        });

        return Object.keys(symbols).map((symbol) => {
            const authors = uniq(message.reactions!.filter(x => x.content === symbol).map(x => x.creator));
            const count = authors.length;
            const userReaction = message.reactions!.find(x => x.content === symbol && x.creator === keys?.pub);

            return {symbol, authors, count, userReaction}
        });
    }, [message.reactions]);

    if (!reactions) return null;

    return <Box sx={{
        display: 'flex',
        mb: '4px'
    }}>{reactions.map((r, i) => {
        return <Box key={r.symbol} sx={{
            fontSize: '0.8em',
            p: '0 6px',
            mr: i === reactions.length - 1 ? null : '4px',
            background: r.userReaction ? blue[800] : theme.palette.background.paper,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            border: '1px solid transparent',
            ':hover': {
                borderColor: theme.palette.divider,
            },
        }} onClick={() => {
            if (r.userReaction) {
                raven?.deleteEvents([r.userReaction.id]);
                console.log('deleteEvents')
            } else {
                raven?.sendReaction(message.id, message.creator, r.symbol);
                console.log('sendReaction');
            }
        }}>
            <Box sx={{mr: '3px'}}>{r.symbol}</Box>
            <Box sx={{
                color: theme.palette.text.disabled,
                fontSize: '0.9em',
            }}>{r.count}</Box>
        </Box>
    })}</Box>;
}

export default MessageReactions;
