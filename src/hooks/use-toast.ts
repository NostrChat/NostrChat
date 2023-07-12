import {useRef} from 'react';
import {useAtom} from 'jotai';
import {toastAtom} from '../atoms';
import {Toast, ToastType} from '../atoms';

const useToast = (): [Toast, (message: string, type: ToastType, timeout?: number) => void, () => void] => {
    const [toast, setToast] = useAtom(toastAtom);
    let timer = useRef<any>();

    const hideMessage = () => {
        setToast({message: null, type: null});
    }

    const showMessage = (message: string, type: ToastType, timeout: number = 5000) => {
        clearTimeout(timer.current);

        setToast({message, type});

        timer.current = setTimeout(() => {
            hideMessage();
        }, timeout);
    };

    return [toast, showMessage, hideMessage]
}

export default useToast;
