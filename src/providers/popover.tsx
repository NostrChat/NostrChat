import React from 'react';
import Popover from '@mui/material/Popover';
import usePopover from 'hooks/use-popover';

const PopoverProvider = (props: { children: React.ReactNode }) => {
    const [popover, setPopover] = usePopover();

    const hide = () => {
        setPopover(null);
    }

    return <>
        {props.children}
        {popover && (
            <Popover
                open={true}
                anchorEl={popover.anchorEl}
                onClose={hide}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                sx={{ml: '10px'}}
                PaperProps={{
                    sx: {
                        overflowY:'hidden'
                    }
                }}
            >{popover.body}</Popover>
        )}
    </>;
}

export default PopoverProvider;
