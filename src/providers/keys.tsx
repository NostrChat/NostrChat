import React, {useEffect} from 'react';
import {getKeys} from 'storage';
import {useAtom} from 'jotai';
import {keysAtom} from 'store';

const KeysProvider = (props: { children: React.ReactNode }) => {
    const [keys, setKeys] = useAtom(keysAtom);

    useEffect(() => {
        getKeys().then(setKeys);
    }, []);

    if (keys === undefined) return null; // Wait until we find keys from storage

    return <>
        {props.children}
    </>;
}

export default KeysProvider;
