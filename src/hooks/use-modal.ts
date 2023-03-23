import {useAtom} from 'jotai';
import {modalAtom, Modal} from 'store';

const useModal = (): [Modal, (modal: Modal) => void] => {
    const [modal, setModal] = useAtom(modalAtom);

    const showModal = (modal: Modal) => {
        setModal(modal);
    }

    return [modal, showModal];
}

export default useModal;
