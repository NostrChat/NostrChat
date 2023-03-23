import {atom} from 'jotai';
import {Keys} from 'types';

const initialKeys = () => {
    let keys: Keys = null;

    try {
        keys = JSON.parse(localStorage.getItem('keys') || '');
    } catch (e) {
    }

    return keys;
}


export const keysAtom = atom<Keys>(initialKeys());
