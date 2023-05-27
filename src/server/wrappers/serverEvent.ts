import type { Client } from '@eleven-am/pondsocket/types';

import { LiveEvent } from '../../client/types';
import { parseAddress } from '../matcher/matcher';

export class ServerEvent {
    readonly #userId: string;

    readonly #client: Client;

    readonly #data: LiveEvent;

    readonly #url: URL;

    constructor (userId: string, client: Client, data: LiveEvent) {
        this.#userId = userId;
        this.#client = client;
        this.#data = data;
        this.#url = new URL(data.address);
    }

    get path () {
        return this.#url.pathname;
    }

    get userId () {
        return this.#userId;
    }

    get action () {
        return this.#data.action;
    }

    get data () {
        return this.#data;
    }

    emit (event: string, data: any) {
        this.#client.broadcastMessage(event, data);
    }

    matches (path: string): boolean {
        return Boolean(parseAddress(`${path}/*`.replace(/\/+/g, '/'), this.#url.pathname));
    }
}
