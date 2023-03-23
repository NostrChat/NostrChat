import {useMemo} from 'react';
import Box from '@mui/material/Box';
import {createAvatar} from '@dicebear/core';
import {adventurerNeutral, initials} from '@dicebear/collection';
import {useTheme} from '@mui/material/styles';


const Avatar = (props: { src?: string, seed: string, size: number, type: 'user' | 'channel', rounded?: boolean }) => {
    const {src, seed, size, type, rounded} = props;
    const theme = useTheme();
    const avatar = useMemo(() => {
        if (src && src.startsWith('https://')) {
            return src;
        }

        const collection = type === 'user' ? adventurerNeutral : initials;

        const avatar = createAvatar(collection, {
            seed: seed,
            size: size
        });

        return avatar.toDataUriSync()
    }, [src, seed, size, type]);

    return <Box component="img" src={avatar} sx={{
        background: theme.palette.divider,
        borderRadius: rounded ? '50%' : theme.shape.borderRadius,
        width: `${size}px`,
        height: `${size}px`,
    }}/>;
}

export default Avatar;
