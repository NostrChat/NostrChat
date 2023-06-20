import {atom} from 'jotai';
import Raven from '../raven/raven';

export const ravenAtom = atom<Raven | undefined>(undefined);
