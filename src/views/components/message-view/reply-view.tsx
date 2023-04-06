import React, {useEffect, useMemo, useState} from 'react';
import {useAtom} from 'jotai';
import {Message} from 'types';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import {Kind, nip19} from 'nostr-tools';
import {directMessagesAtom, profilesAtom, publicMessagesAtom, ravenAtom} from 'store';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import {truncate, truncateMiddle} from 'util/truncate';

const ReplyView = (props: { parent: Message }) => {
    const {parent} = props;
    const theme = useTheme();
    const [publicMessages] = useAtom(publicMessagesAtom);
    const [directMessages] = useAtom(directMessagesAtom);
    const [, isMd] = useMediaBreakPoint();
    const [profiles] = useAtom(profilesAtom);
    const [raven] = useAtom(ravenAtom);
    const [message, setMessage] = useState<Message | null>(null);
    const [notFound, setNotFound] = useState<boolean>(false);
    const profile = message && profiles.find(x => x.creator === message.creator);
    const profileName = useMemo(() => message && truncateMiddle((profile?.name || nip19.npubEncode(message.creator)), (isMd ? 40 : 24), ':'), [profile, message]);

    useEffect(() => {
        if (!parent.replyTo) return;
        const msg = 'decrypted' in parent ? directMessages.find(x => x.id === parent.replyTo) : publicMessages.find(x => x.id === parent.replyTo);
        if (msg) {
            setMessage(msg);
            return;
        }

        raven?.fetchById(parent.replyTo).then(resp => {
            const [ev,] = resp;
            if (!ev) return;
            const msg = ev.kind === Kind.ChannelMessage ? raven?.eventToPublicMessage(ev) : raven?.eventToDirectMessage(ev);

            if (msg) {
                setMessage(msg);
            } else {
                setNotFound(true);
            }
        }).catch(() => {
            setNotFound(true);
        });
    }, [directMessages, publicMessages]);

    useEffect(() => {
        // load profile of the replied message's sender if not exists in the state
        if (message && 'mentions' in message) {
            raven?.loadProfiles(message.mentions);
        }
    }, [message]);


    if (!parent.replyTo) return null;
    if (notFound) return null;

    return <Box sx={{
        height: '56px',
        p: '4px',
        mb: '6px',
        fontSize: '0.8em',
        borderLeft: `6px solid ${theme.palette.primary.main}`,
        opacity: .6
    }}>
        {(() => {
            if (message) {
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
            }

            return null;
        })()}
    </Box>;
}

export default ReplyView;
