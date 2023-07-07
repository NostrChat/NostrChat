import React, {useState} from 'react';
import {useAtom} from 'jotai';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import useTranslation from 'hooks/use-translation';
import {ravenAtom} from 'atoms';
import Send from 'svg/send';

const DmInput = (props: { pubkey: string, onDM: () => void }) => {
    const {pubkey, onDM} = props;
    const [message, setMessage] = useState('');
    const [raven] = useAtom(ravenAtom);
    const [t] = useTranslation();

    const send = () => {
        if (message.trim() !== '') {
            raven?.sendDirectMessage(pubkey, message).then(() => {
                setMessage('');
                onDM();
            });
        }
    }

    return <TextField
        autoComplete="off"
        InputProps={{
            sx: {
                fontSize: '14px',
                pr: '3px'
            },
            endAdornment: <>
                <Button variant="contained" size="small" color="primary" sx={{
                    minWidth: 'auto',
                    width: '28px',
                    height: '28px',
                    padding: '6px',
                    borderRadius: '4px'
                }} onClick={send}><Send height={28}/></Button>
            </>
        }}
        size="small"
        fullWidth
        placeholder={t('Send direct message')}
        value={message}
        onChange={(e) => {
            setMessage(e.target.value);
        }}
        onKeyUp={(e) => {
            if (e.key === 'Enter') {
                send();
            }
        }}
    />
}

export default DmInput;
