import {SecureStoragePlugin} from 'capacitor-secure-storage-plugin';
import {PLATFORM} from 'const';
import {Keys} from 'types';

const isCapacitor = PLATFORM === 'ios' || PLATFORM === 'android';

export const getKeys = async (): Promise<Keys> => {
    let keysRaw: null | string;

    if (isCapacitor) {
        try {
            keysRaw = await SecureStoragePlugin.get({key: 'keys'}).then(a => a.value);
        } catch (e) {
            keysRaw = null;
        }
    } else if (PLATFORM === 'web') {
        keysRaw = localStorage.getItem('keys');
    } else {
        throw new Error('Not implemented');
    }

    if (keysRaw !== null) {
        try {
            return JSON.parse(keysRaw);
        } catch (e) {

        }
    }

    return null;
}

export const storeKeys = async (keys: Keys): Promise<void> => {
    if (isCapacitor) {
        await SecureStoragePlugin.set({key: 'keys', value: JSON.stringify(keys)});
    } else if (PLATFORM === 'web') {
        localStorage.setItem('keys', JSON.stringify(keys));
    } else {
        throw new Error('Not implemented');
    }
}
