import { IncomingHttpHeaders, IncomingMessage } from 'http';

import type { Client } from '@eleven-am/pondsocket/types';

import { parseAddress } from '../matcher/matcher';

interface SocketEvent {
    address: string;
    client: Client;
    userId: string;
}

export class Request {
    #path: URL;

    #cookies: Record<string, string>;

    #headers: IncomingHttpHeaders;

    #userId: string;

    constructor () {
        this.#path = new URL('http://localhost');
        this.#userId = '';
        this.#cookies = {
        };
        this.#headers = {
        };
    }

    get url (): URL {
        return this.#path;
    }

    get cookies (): Record<string, string> {
        return this.#cookies;
    }

    get headers (): IncomingHttpHeaders {
        return this.#headers;
    }

    get userId (): string {
        return this.#userId;
    }

    static fromRequest (req: IncomingMessage, userId: string): Request {
        const request = new Request();

        request.#userId = userId;
        request.#path = new URL(`https://${req.headers.host}${req.url}`);
        request.#headers = req.headers;
        const cookies = request.#headers.cookie?.split(';') ?? [];

        request.#cookies = Object.fromEntries(cookies.map((cookie) => cookie.split('=')));

        return request;
    }

    matches (path: string): boolean {
        return Boolean(parseAddress(`${path}/*`.replace(/\/+/g, '/'), this.#path.pathname));
    }
}

