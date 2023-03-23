import {useAtom} from 'jotai';
import {popoverAtom, Popover} from 'store';

const usePopover = (): [Popover, (popover: Popover) => void] => {
    const [popover, setPopover] = useAtom(popoverAtom);

    const showPopover = (popover: Popover) => {
        setPopover(popover);
    }

    return [popover, showPopover];
}

export default usePopover;
