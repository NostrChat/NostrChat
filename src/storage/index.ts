import {SecureStoragePlugin} from 'capacitor-secure-storage-plugin';
import {PLATFORM} from 'const';
import {Keys} from 'types';

const isCapacitor = PLATFORM === 'ios' || PLATFORM === 'android';

const getItem = async (key: string): Promise<any> => {
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