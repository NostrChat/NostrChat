import moment from 'moment';
import {RelayDict} from 'types';
import {DEFAULT_RELAYS} from 'const';

export const formatMessageTime = (unixTs: number) => moment.unix(unixTs).format('h:mm a');

export const formatMessageFromNow = (unixTs: number) => moment.unix(unixTs).fromNow();

export const formatMessageDate = (unixTs: number) => moment.unix(unixTs).format('dddd, MMMM Do');

export const formatMessageDateTime = (unixTs: number) => moment.unix(unixTs).format('dddd, MMMM Do h:mm a');