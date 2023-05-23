// eslint-disable-next-line import/no-unresolved
import { IncomingMessage, IncomingHttpHeaders } from 'http';

import { EventParams } from '@eleven-am/pondsocket/types';

import { parseAddress } from '../matcher/matcher';

export class Request {
    readonly #request: IncomingMessage;

    #path: string;

    #query: Record<string, string>;

    #cookies: Record<string, string>;

    #params: EventParams<any> | null;

    readonly #headers: IncomingHttpHeaders;

    constructor (request: IncomingMessage) {
        if (request.method !== 'GET') {
            throw new Error('Invalid request method');
        }

        this.#path = '/';
        this.#query = {};
        this.#cookies = {};
        this.#request = request;
        this.#headers = request.headers;
        this.#params = null;

        this.#init(request);
    }

    get path (): string {
        return this.#path;
    }

    get query (): Record<string, string> {
        return this.#query;
    }

    get cookies (): Record<string, string> {
        return this.#cookies;
    }

    get headers (): IncomingHttpHeaders {
        return this.#headers;
    }

    parseParams (path: string): EventParams<any> | null {
        this.#params = parseAddress(path, this.#path);

        return this.#params;
    }

    #init (request: IncomingMessage): void {
        const { searchParams } = new URL(request.url ?? '', 'http://localhost');
        const entries = searchParams.entries();

        this.#query = Object.fromEntries(entries);
        this.#path = this.#path.split('?')[0];

        const cookies = this.#request.headers.cookie?.split(';') ?? [];

        this.#cookies = Object.fromEntries(cookies.map((cookie) => cookie.split('=')));
    }
}
