import moment from 'moment';
import {RelayDict} from 'types';
import {DEFAULT_RELAYS} from 'const';

export const formatMessageTime = (unixTs: number) => moment.unix(unixTs).format('h:mm a');

export const formatMessageDate = (unixTs: number) => moment.unix(unixTs).format('dddd, MMMM Do');

export const getRelays = (): RelayDict => {
    let relayDict: RelayDict = DEFAULT_RELAYS;

    try {
        relayDict = JSON.parse(localStorage.getItem('relays') || '');
    } catch (e) {
    }

    return relayDict;
}
