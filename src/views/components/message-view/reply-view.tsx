import React, {useMemo} from 'react';
import {useAtom} from 'jotai';
import {Message} from 'types';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import {nip19} from 'nostr-tools';
import {directMessagesAtom, profilesAtom, publicMessagesAtom} from 'store';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import {truncate, truncateMiddle} from 'util/truncate';

const ReplyView = (props: { parent: Message }) => {
    const {parent} = props;
    const theme = useTheme();
    const [publicMessages] = useAtom(publicMessagesAtom);
    const [directMessages] = useAtom(directMessagesAtom);
    const [, isMd] = useMediaBreakPoint();
    const [profiles] = useAtom(profilesAtom);
    const message = 'decrypted' in parent ? directMessages.find(x => x.id === parent.replyTo) : publicMessages.find(x => x.id === parent.replyTo);
    const profile = message && profiles.find(x => x.creator === message.creator);
    const profileName = useMemo(() => message && truncateMiddle((profile?.name || nip19.npubEncode(message.creator)), (isMd ? 40 : 24), ':'), [profile, message]);

    if (!message) return null;

    return <Box sx={{
        height: '56px',
        p: '4px',
        mb: '6px',
        fontSize: '0.8em',
        borderLeft: `6px solid ${theme.palette.primary.main}`,
        opacity: .6
    }}>
        {(() => {
            if (!message) return null;
            return <>
                <Box sx={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    fontWeight: '600',
                    mb: '4px'
                }}>
                    {profileName}
                </Box>
                <Box sx={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                }}>{truncate(message.content, 500)}</Box>
            </>;
        })()}
    </Box>;
}

export default ReplyView;
