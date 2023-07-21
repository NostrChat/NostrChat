import * as Comlink from 'comlink';
import {Event, Filter, SimplePool, Sub} from 'nostr-tools';

export class BgRaven {
    private seenOn: Record<string, string[]> = {};
    private subs: Record<string, Sub> = {};
    private relays: string[] = [];
    private pool = new SimplePool();
    private poolCreated = Date.now();

    public setup(relays: string[]) {
        this.relays = relays;
    }

    private getPool = (): SimplePool => {
        if (Date.now() - this.poolCreated > 120000) {
            // renew pool every two minutes
            this.pool.close(this.relays);

            this.pool = new SimplePool();
            this.poolCreated = Date.now();
        }

        return this.pool;
    }

    public fetch(filters: Filter[], quitMs: number = 0): Promise<Event[]> {
        return new Promise((resolve) => {
            const pool = this.getPool();
            const sub = pool.sub(this.relays, filters);
            const events: Event[] = [];

            const quit = () => {
                sub.unsub();
                resolve(events);
            }

            let timer: any = quitMs > 0 ? setTimeout(quit, quitMs) : null;

            sub.on('event', (event: Event) => {
                events.push(event);
                this.seenOn[event.id] = pool.seenOn(event.id);

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
        const pool = this.getPool();
        const sub = pool.sub(this.relays, filters, {id: subId});

        sub.on('event', (event) => {
            this.seenOn[event.id] = pool.seenOn(event.id);
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
        if (this.subs[subId]) {
            this.subs[subId].unsub();
            delete this.subs[subId];
        }
    }

    public async where(eventId: string) {
        let try_ = 0;
        while (!this.seenOn[eventId]) {
            await this.fetch([{ids: [eventId]}]);
            try_++;
            if (try_ === 3) {
                break;
            }
        }

        if (!this.seenOn[eventId]) {
            throw new Error('Could not find root event');
        }

        return this.findHealthyRelay(this.seenOn[eventId]);
    }

    private async findHealthyRelay(relays: string[]) {
        const pool = this.getPool();
        for (const relay of relays) {
            try {
                await pool.ensureRelay(relay);
                return relay;
            } catch (e) {
            }
        }

        throw new Error("Couldn't find a working relay");
    }
}

Comlink.expose(new BgRaven());
