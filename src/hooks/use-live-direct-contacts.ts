import {useAtom} from 'jotai';
import {directContactsAtom, directMessagesAtom, muteListAtom} from 'store';
import {useMemo} from 'react';

const useLiveDirectContacts = () => {
    const [directContacts] = useAtom(directContactsAtom);
    const [directMessages] = useAtom(directMessagesAtom);
    const [muteList] = useAtom(muteListAtom);

    return useMemo(() => directContacts
        .filter(c => muteList.pubkeys.find(x => x === c.pub) === undefined)
        .sort((a, b) => {
            const aLastMessage = directMessages.filter(x => x.peer === a.pub).sort((a, b) => b.created - a.created)[0]?.created;
            const bLastMessage = directMessages.filter(x => x.peer === b.pub).sort((a, b) => b.created - a.created)[0]?.created;
            return (bLastMessage || 0) - (aLastMessage || 0);
        }), [directContacts, directMessages, muteList]);
}

export default useLiveDirectContacts;
