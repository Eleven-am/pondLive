import { IncomingMessage, IncomingHttpHeaders } from 'http';

import { parseAddress } from '../matcher/matcher';

export class Request {
    readonly #request: IncomingMessage;

    readonly #path: URL;

    #cookies: Record<string, string>;

    readonly #headers: IncomingHttpHeaders;

    constructor (request: IncomingMessage) {
        if (request.method !== 'GET') {
            throw new Error('Invalid request method');
        }

        this.#cookies = {};
        this.#request = request;
        this.#headers = request.headers;
        this.#path = new URL(request.url ?? '', `https://${request.headers.host}`);

        this.#init();
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

    matches (path: string): boolean {
        return Boolean(parseAddress(`${path}/*`.replace(/\/+/g, '/'), this.#path.pathname));
    }

    #init (): void {
        const cookies = this.#headers.cookie?.split(';') ?? [];

        this.#cookies = Object.fromEntries(cookies.map((cookie) => cookie.split('=')));
    }
}
