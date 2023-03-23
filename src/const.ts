import {Channel, RelayDict} from 'types';

export const DEFAULT_RELAYS: RelayDict = {
    'wss://relay1.nostrchat.io': {read: true, write: true},
    'wss://relay2.nostrchat.io': {read: true, write: true},
};

export const GLOBAL_CHAT: Channel = {
    id: 'f412192fdc846952c75058e911d37a7392aa7fd2e727330f4344badc92fb8a22',
    name: 'Global Chat',
    about: 'Whatever you want it to be, just be nice',
    picture: '',
    creator: 'aea59833635dd0868bc7cf923926e51df936405d8e6a753b78038981c75c4a74',
    created: 1678198928
};
