import React, {useEffect} from 'react';
import {useAtom} from 'jotai';
import {spammersAtom} from 'atoms';

const RemoteDataProvider = (props: { children: React.ReactNode }) => {
    const [, setSpammers] = useAtom(spammersAtom);

    useEffect(() => {
        fetch('https://spam.nostrchat.io/list').then(r => r.json()).then(r => {
            const d:Record<string, number> = {}
            for(const item of r.list){
                d[item.pub] = item.score;
            }
            setSpammers(d)
        })
    }, []);

    return <>
        {props.children}
    </>;
}

export default RemoteDataProvider;
