import {SecureStoragePlugin} from 'capacitor-secure-storage-plugin';
import {DEFAULT_RELAYS, PLATFORM} from 'const';
import {Keys, RelayDict} from 'types';
import {PaletteMode} from '@mui/material';

const isCapacitor = PLATFORM === 'ios' || PLATFORM === 'android';

const getItem = async (key: string): Promise<any | null> => {
    let valueRaw: null | string;

    if (isCapacitor) {
        try {
            valueRaw = await SecureStoragePlugin.get({key}).then(a => a.value);
        } catch (e) {
            valueRaw = null;
        }
    } else if (PLATFORM === 'web') {
        valueRaw = localStorage.getItem(key);
    } else {
        throw new Error('Not implemented');
    }

    if (valueRaw !== null) {
        try {
            return JSON.parse(valueRaw);
        } catch (e) {

        }
    }

    return null;
}

const setItem = async (key: string, value: any): Promise<void> => {
    if (isCapacitor) {
        await SecureStoragePlugin.set({key, value: JSON.stringify(value)});
    } else if (PLATFORM === 'web') {
        localStorage.setItem(key, JSON.stringify(value));
    } else {
        throw new Error('Not implemented');
    }
}

const removeItem = async (key: string): Promise<void> => {
    if (isCapacitor) {
        await SecureStoragePlugin.remove({key});
    } else if (PLATFORM === 'web') {
        localStorage.removeItem(key);
    } else {
        throw new Error('Not implemented');
    }
}

export const getKeys = async (): Promise<Keys> => getItem('keys');
export const storeKeys = async (keys: Keys): Promise<void> => setItem('keys', keys);
export const removeKeys = async (): Promise<void> => removeItem('keys');
export const getRelays = (): Promise<RelayDict> => getItem('relays').then(r => r || DEFAULT_RELAYS);
export const getRelaysNullable = (): Promise<RelayDict | null> => getItem('relays');
export const storeRelays = async (relays: RelayDict) => setItem('relays', relays);
export const removeRelays = async (): Promise<void> => removeItem('relays');
export const getAppTheme = async (): Promise<PaletteMode> => getItem('app_theme');
export const storeAppTheme = async (theme: PaletteMode) => setItem('app_theme', theme);

// Skipping using capacitor secure plugin for storing editor history and putting function here to have a clear structure for local storage.
export const getEditorValue = (key: string) => localStorage.getItem(key);
export const storeEditorValue = (key: string, value: string) => localStorage.setItem(key, value);
export const removeEditorValue = (key: string) => localStorage.removeItem(key);