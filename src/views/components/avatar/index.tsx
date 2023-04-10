import {useMemo} from 'react';
import Box from '@mui/material/Box';
import {createAvatar} from '@dicebear/core';
import {adventurerNeutral} from '@dicebear/collection';
import {useTheme} from '@mui/material/styles';


const Avatar = (props: { src?: string, seed: string, size: number, rounded?: boolean }) => {
    const {src, seed, size, rounded} = props;
    const theme = useTheme();
    const avatar = useMemo(() => {
        if (src && src.startsWith('https://')) {
            return src;
        }

        const avatar = createAvatar(adventurerNeutral, {
            seed: seed,
            size: size
        });

        return avatar.toDataUriSync()
    }, [src, seed, size]);

    return <Box component="img" src={avatar} sx={{
        background: theme.palette.divider,
        borderRadius: rounded ? '50%' : theme.shape.borderRadius,
        width: `${size}px`,
        height: `${size}px`,
    }}/>;
}

export default Avatar;
