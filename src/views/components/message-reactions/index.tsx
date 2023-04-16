import {useMemo} from 'react';
import Box from '@mui/material/Box';
import uniq from 'lodash.uniq';
import {useAtom} from 'jotai';
import {keysAtom} from 'store';
import ReactionBtn from 'views/components/message-reactions/reaction-btn';
import {Message, ReactionCombined} from 'types';


const MessageReactions = (props: { message: Message }) => {
    const {message} = props;
    const [keys] = useAtom(keysAtom);

    const reactions: ReactionCombined[] | null = useMemo(() => {
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
    }}>
        {reactions.map((r, i) => <ReactionBtn key={r.symbol} message={message} r={r} mr={i < reactions.length - 1}/>)}
    </Box>;
}

export default MessageReactions;
