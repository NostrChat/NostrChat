import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import {grey} from '@mui/material/colors';
import useTranslation from 'hooks/use-translation';
import {MentionListProps, MentionListRef} from 'views/components/chat-input/types';


const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const theme = useTheme();
    const [t] = useTranslation();

    const selectItem = (index: number) => {
        const item = props.items[index]

        if (item) {
            props.command({id: '', label: item.name});
        }
    }

    const upHandler = () => {
        setSelectedIndex(((selectedIndex + props.items.length) - 1) % props.items.length);
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    }

    const enterHandler = () => {
        selectItem(selectedIndex);
    }

    useEffect(() => setSelectedIndex(0), [props.items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({event}) => {
            if (event.key === 'ArrowUp') {
                upHandler()
                return true
            }

            if (event.key === 'ArrowDown') {
                downHandler()
                return true
            }

            if (event.key === 'Enter') {
                enterHandler()
                return true
            }

            return false
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
            {props.items.length ? props.items.map((item, index) => (
                    <Box key={index} sx={{
                        display: 'flex',
                        p: '4px 14px',
                        cursor: 'pointer',
                        borderRadius: theme.shape.borderRadius,
                        background: index === selectedIndex ? grey[800] : null,

                    }} onClick={() => selectItem(index)}>
                        <Box>{item.name}</Box>
                    </Box>
                ))
                : <Box sx={{p: '4px 14px',}}>{t('No result')}</Box>
            }
        </Box>
    )

});

export default MentionList;