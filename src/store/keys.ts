import {atom} from 'jotai';
import {Keys} from 'types';
export const keysAtom = atom<Keys | undefined>(undefined);
