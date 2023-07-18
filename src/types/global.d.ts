import Raven from 'raven/raven';
import {Event} from 'nostr-tools';
import {RelayDict} from 'types';

declare global {
    interface Window {
        raven?: Raven;
        nostr?: {
            getPublicKey: () => Promise<string>;
            signEvent: (event: Event) => Promise<Event>;
            getRelays: () => Promise<RelayDict>;
            nip04: {
                encrypt: (pubkey: string, content: string) => Promise<string>;
                decrypt: (pubkey: string, content: string) => Promise<string>;
            };
        };
        requestPrivateKey: (event: Event) => Promise<string>;
    }
}
