import React from 'react';
import Popover from '@mui/material/Popover';
import usePopover from 'hooks/use-popover';

const PopoverProvider = (props: { children: React.ReactNode }) => {
    const [popover, setPopover] = usePopover();

    const hide = () => {
        setPopover(null);
        popover?.onClose?.();
    }

    return <>
        {props.children}
        {popover && (
            <Popover
                transitionDuration={0}
                open={true}
                anchorEl={popover.anchorEl}
                onClose={hide}
                anchorOrigin={{
                    vertical: popover.toBottom ? 'bottom' : 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: popover.toRight ? 'right' : 'left',
                }}
                sx={{ml: '10px'}}
                PaperProps={{
                    sx: {
                        overflowY: 'hidden'
                    }
                }}
            >{popover.body}</Popover>
        )}
    </>;
}

export default PopoverProvider;
