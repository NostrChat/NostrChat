import React, {useEffect} from 'react';
import {useAtom} from 'jotai';
import {spammersAtom} from 'atoms';

const RemoteDataProvider = (props: { children: React.ReactNode }) => {
    const [, setSpammers] = useAtom(spammersAtom);

    useEffect(() => {
        fetch('https://spam.nostrchat.io/list').then(r => r.json()).then(r => {
            setSpammers(r.list)
        })
    }, []);

    return <>
        {props.children}
    </>;
}

export default RemoteDataProvider;
