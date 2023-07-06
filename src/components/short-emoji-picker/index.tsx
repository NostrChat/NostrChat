import {useEffect, useState} from 'react';
import data from '@emoji-mart/data'
import {init} from 'emoji-mart'
import {FrequentlyUsed, getEmojiDataFromNative} from 'emoji-mart';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import Plus from 'svg/plus';

// this is required for getEmojiDataFromNative queries
init({data}).then();

const ShortEmojiPicker = (props: { onSelect: (selected: string) => void, onMore: () => void }) => {
    const {onSelect, onMore} = props;
    const theme = useTheme();
    const [frequent, setFrequent] = useState<string[] | null>(null);
    useEffect(() => {
        if (frequent === null) {
            // @ts-ignore
            const promises = Object.values(FrequentlyUsed.get({
                maxFrequentRows: 2,
                perLine: 3
            })).map(x => getEmojiDataFromNative(x));
            Promise.all(promises).then(freq => {
                setFrequent(freq.map(x => x.native))
            });
        }
    }, [frequent]);

    if (frequent === null) return null;

    const commonSx = {
        width: '40px',
        height: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        borderRadius: '50%',
        ':hover': {
            background: theme.palette.divider
        },
    }

    return <>
        <Box sx={{p: '6px', background: theme.palette.background.default}}>
            <Box sx={{display: 'flex'}}>
                {frequent.map((e, i) =>
                    <Box sx={{
                        fontSize: '24px',
                        ...commonSx,

                    }} onClick={() => {
                        onSelect(e);
                    }} key={i}>{e}</Box>
                )}
                <Box sx={commonSx} onClick={onMore}>
                    <Plus height={20}/>
                </Box>
            </Box>
        </Box>
    </>
}

export default ShortEmojiPicker;