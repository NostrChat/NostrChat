import TextField from '@mui/material/TextField';
import React from 'react';

const PictureInput = (props: { label: string, value: string, onChange: (value: string) => void, error: string }) => {
    const {label, value, onChange, error} = props;

    const changed = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return <TextField label={label} value={value} onChange={changed} fullWidth autoComplete="off"
                      error={!!error} helperText={error || ' '}/>
}


export default PictureInput;
