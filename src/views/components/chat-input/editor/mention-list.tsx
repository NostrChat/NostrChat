import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import uniqBy from 'lodash.uniqby';
import {useAtom} from 'jotai';
import {useTheme} from '@mui/material/styles';
import {grey} from '@mui/material/colors';
import useTranslation from 'hooks/use-translation';
import useLiveChannel from 'hooks/use-live-channel';
import useLivePublicMessages from 'hooks/use-live-public-messages';
import {MentionListProps, MentionListRef} from 'views/components/chat-input/editor/types';
import Avatar from 'views/components/avatar';
import {directMessageAtom, profilesAtom} from 'store';
import {notEmpty} from 'util/misc';


const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
    const {query} = props;
    const [profiles,] = useAtom(profilesAtom);
    const channel = useLiveChannel();
    const [directMessage,] = useAtom(directMessageAtom);
    const messages = useLivePublicMessages(channel?.id);

    const suggestionProfiles = useMemo(() => {
        if (channel) {
            return uniqBy(messages.map(m => profiles.find(x => x.creator === m.creator)).filter(notEmpty), 'creator')
        } else if (directMessage) {
            return profiles.filter(x => x.creator === directMessage);
        }

        return [];
    }, [channel, messages, directMessage, profiles]);

    const items = useMemo(() => suggestionProfiles.filter(x => x.name)
        .filter(x => x.name.toLowerCase().indexOf(query.toLowerCase()) > -1).slice(0, 10).map(x => ({
            name: x.name,
            id: x.creator,
            picture: x.picture
        })), [suggestionProfiles, query]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const theme = useTheme();
    const [t] = useTranslation();

    const selectItem = (index: number) => {
        const item = items[index]
        if (item) {
            props.command({id: item.id, label: item.name});
        }
    }

    const upHandler = () => {
        setSelectedIndex(((selectedIndex + items.length) - 1) % items.length);
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % items.length);
    }

    const enterHandler = () => {
        selectItem(selectedIndex);
    }

    useEffect(() => setSelectedIndex(0), [items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({event}) => {
            if (event.key === 'ArrowUp') {
                upHandler();
                return true;
            }

            if (event.key === 'ArrowDown') {
                downHandler();
                return true;
            }

            if (event.key === 'Enter') {
                enterHandler();
                return true;
            }

            return false;
        },
    }))

    return (
        <Box sx={{
            width: '100%',
            background: grey[900],
            boxShadow: theme.shadows[10],
            borderRadius: theme.shape.borderRadius,
            fontSize: '90%',
            p: '3px',
            color: grey[300],
        }}>
            {items.length ? items.map((item, index) => (
                <Box key={index} sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: '4px 14px',
                    cursor: 'pointer',
                    borderRadius: theme.shape.borderRadius,
                    background: index === selectedIndex ? grey[800] : null,
                    mb: index === items.length - 1 ? null : '4px',
                    ':hover': {
                        background: grey[800]
                    }
                }} onClick={() => selectItem(index)}>
                    <Avatar seed={item.id} size={20} src={item.picture}/>
                    <Box sx={{ml: '4px'}}>{item.name}</Box>
                </Box>
            )) : <Box sx={{p: '4px 14px',}}>{t('No result')}</Box>}
        </Box>
    )
});

export default MentionList;
