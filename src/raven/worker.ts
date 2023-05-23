import * as Comlink from 'comlink';
import {Event, Filter, SimplePool, Sub} from 'nostr-tools';

let RELAYS: string[];
let POOL: SimplePool;

export class RavenBgWorker {
    subs: Record<string, Sub> = {};

    public setup(relays: string[]) {
        RELAYS = relays;
        POOL = new SimplePool();
    }

    public fetch(filters: Filter[], quitMs: number = 0): Promise<Event[]> {
        return new Promise((resolve) => {
            const sub = POOL.sub(RELAYS, filters);
            const events: Event[] = [];

            const quit = () => {
                sub.unsub();
                resolve(events);
            }

            let timer: any = quitMs > 0 ? setTimeout(quit, quitMs) : null;

            sub.on('event', (event: Event) => {
                events.push(event);

                if (quitMs > 0) {
                    clearTimeout(timer);
                    timer = setTimeout(quit, quitMs);
                }
            });

            if (quitMs === 0) {
                sub.on('eose', () => {
                    sub.unsub();
                    resolve(events);
                });
            }
        });
    }

    public sub(filters: Filter[], onEvent: (e: Event) => void, unsub: boolean = true) {
        const subId = Math.random().toString().slice(2);

        const sub = POOL.sub(RELAYS, filters, {id: subId});

        sub.on('event', (event) => {
            onEvent(event)
        });

        sub.on('eose', () => {
            if (unsub) {
                this.unsub(subId);
            }
        });

        this.subs[subId] = sub;
        return subId;
    }

    public unsub(subId: string) {
        this.subs[subId].unsub();
        delete this.subs[subId];
    }
}

Comlink.expose(new RavenBgWorker());
