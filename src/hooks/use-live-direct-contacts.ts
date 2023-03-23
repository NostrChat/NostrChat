import {useAtom} from 'jotai';
import {directContactsAtom, directMessagesAtom} from 'store';

const useLiveDirectContacts = () => {
    const [directContacts] = useAtom(directContactsAtom);
    const [directMessages] = useAtom(directMessagesAtom);

    return directContacts.sort((a, b) => {
        const aLastMessage = directMessages.filter(x => x.peer === a.pub).sort((a, b) => b.created - a.created)[0]?.created;
        const bLastMessage = directMessages.filter(x => x.peer === b.pub).sort((a, b) => b.created - a.created)[0]?.created;
        return (bLastMessage || 0) - (aLastMessage || 0);
    });
}

export default useLiveDirectContacts;
