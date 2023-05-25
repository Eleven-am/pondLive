import { IncomingHttpHeaders, IncomingMessage } from 'http';

import type { Client, PondMessage } from '@eleven-am/pondsocket/types';

import { parseAddress } from '../server/matcher/matcher';

interface SocketEvent {
    payload: PondMessage;
    client: Client;
}

export class Request {
    #path: URL;

    #cookies: Record<string, string>;

    #headers: IncomingHttpHeaders;

    #payload: any;

    constructor () {
        this.#path = new URL('http://localhost');
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

    get payload (): any {
        return this.#payload;
    }

    static fromRequest (req: IncomingMessage): Request {
        const request = new Request();

        request.#path = new URL(`https://${req.headers.host}${req.url}`);
        request.#headers = req.headers;
        const cookies = request.#headers.cookie?.split(';') ?? [];

        request.#cookies = Object.fromEntries(cookies.map((cookie) => cookie.split('=')));

        return request;
    }

    static fromSocketEvent (event: SocketEvent): Request {
        const request = new Request();

        request.#path = new URL(event.payload.address as string);
        request.#payload = event.payload;

        return request;
    }

    matches (path: string): boolean {
        return Boolean(parseAddress(`${path}/*`.replace(/\/+/g, '/'), this.#path.pathname));
    }
}

