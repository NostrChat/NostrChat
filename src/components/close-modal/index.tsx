import IconButton from '@mui/material/IconButton';
import React from 'react';
import CloseIcon from 'svg/close';

const CloseModal = (props: { onClick: () => void }) => {
    return <IconButton
        aria-label="close"
        onClick={props.onClick}
        sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
        }}
    >
        <CloseIcon height={22}/>
    </IconButton>
}

export default CloseModal;
