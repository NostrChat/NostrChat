import React, {useState} from 'react';
import {useAtom} from 'jotai';
import TextField from '@mui/material/TextField';
import useTranslation from 'hooks/use-translation';
import {ravenAtom} from 'store';

const DmInput = (props: { pubkey: string, onDM: () => void }) => {
    const {pubkey, onDM} = props;
    const [message, setMessage] = useState('');
    const [raven] = useAtom(ravenAtom);
    const [t] = useTranslation();

    return <TextField
        autoComplete="off"
        InputProps={{sx: {fontSize: '14px'}}}
        size="small"
        fullWidth
        placeholder={t('Send direct message')}
        value={message}
        onChange={(e) => {
            setMessage(e.target.value);
        }}
        onKeyUp={(e) => {
            if (e.key === 'Enter' && message.trim() !== '') {
                raven?.sendDirectMessage(pubkey, message).then(() => {
                    setMessage('');
                    onDM();
                });
            }
        }}
    />
}

export default DmInput;
