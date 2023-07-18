import {atom} from 'jotai';
import {Breakpoint, PaletteMode} from '@mui/material';

export type ToastType = null | 'error' | 'warning' | 'info' | 'success';

export interface Toast {
    message: null | string,
    type: ToastType
}

export type Modal = { body: JSX.Element, fullScreen?: boolean, maxWidth?: Breakpoint, hideOnBackdrop?: boolean, onHide?: () => void } | null;

export type Popover =
    { body: JSX.Element, anchorEl: HTMLElement, toRight?: boolean, toBottom?: boolean, onClose?: () => void }
    | null;

export const themeAtom = atom<PaletteMode | undefined>(undefined);
export const toastAtom = atom<Toast>({message: null, type: null});
export const modalAtom = atom<Modal>(null);
export const popoverAtom = atom<Popover>(null);
export const appMenuAtom = atom<boolean>(false);
