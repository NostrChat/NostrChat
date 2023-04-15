import {Message} from 'types';
import {useMemo} from 'react';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import uniq from 'lodash.uniq';
import {useAtom} from 'jotai';
import {keysAtom, ravenAtom} from 'store';
import {blue} from '@mui/material/colors';

const MessageReactions = (props: { message: Message }) => {
    const {message} = props;
    const theme = useTheme();
    const [keys] = useAtom(keysAtom);
    const [raven] = useAtom(ravenAtom);

    const reactionList = useMemo(() => message.reactions ? uniq(message.reactions.sort((a, b) => a.created - b.created).map(r => r.content)) : [], [message.reactions]);

    if (!message.reactions) return null;

    return <Box sx={{
        display: 'flex',
        mb: '4px'
    }}>{reactionList.map(r => {
        const authors = uniq(message.reactions!.filter(x => x.content === r).map(x => x.creator));
        const count = authors.length;
        const reacted = message.reactions!.find(x => x.content === r && x.creator === keys?.pub);

        return <Box sx={{
            fontSize: '0.8em',
            p: '0 6px',
            mr: '4px',
            background: reacted ? blue[800] : theme.palette.background.paper,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            border: '1px solid transparent',
            ':hover': {
                borderColor: theme.palette.divider,
            },
        }} onClick={() => {
            if(reacted){
                raven?.deleteEvents([reacted.id]);
                console.log('deleteEvents')
            } else {
                raven?.sendReaction(message.id, message.creator, r);
                console.log('sendReaction');
            }
        }}>
            <Box sx={{mr: '3px'}}>
                {r}
            </Box>
            <Box sx={{
                color: theme.palette.text.disabled,
                fontSize: '0.9em',
            }}>{count}</Box>
        </Box>
    })}</Box>;
}

export default MessageReactions;
