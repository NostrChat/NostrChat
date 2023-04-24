import {HDKey} from '@scure/bip32';
import * as secp256k1 from '@noble/secp256k1';

export const privateKeyFromSeed = (seed: string) => {
    const root = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'));
    const privateKey = root.derive("m/44'/1237'/0'/0/0").privateKey;
    if (!privateKey) {
        throw new Error('could not derive private key')
    }
    return secp256k1.utils.bytesToHex(privateKey);
}


export const sha256 = async (text: string) => {
    const textAsBuffer = new TextEncoder().encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', textAsBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const isSha256 = (s: string) => /^[a-f0-9]{64}$/gi.test(s);
