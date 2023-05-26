import type { Client } from '@eleven-am/pondsocket/types';

import { LiveEvent } from '../../client/types';
import { parseAddress } from '../matcher/matcher';

export class ServerEvent {
    readonly #path: string;

    readonly #userId: string;

    readonly #client: Client;

    readonly #data: LiveEvent;

    constructor (path: string, userId: string, client: Client, data: LiveEvent) {
        this.#path = path;
        this.#userId = userId;
        this.#client = client;
        this.#data = data;
    }

    get path () {
        return this.#path;
    }

    get userId () {
        return this.#userId;
    }

    get params () {
        const data = parseAddress(this.#path, this.#data.address);

        return data?.params || {};
    }

    get query () {
        const data = parseAddress(this.#path, this.#data.address);

        return data?.query || {};
    }

    get data () {
        return this.#data;
    }

    emit (event: string, data: any) {
        this.#client.broadcastMessage(event, data);
    }
}
