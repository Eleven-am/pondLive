import { IncomingHttpHeaders, IncomingMessage } from 'http';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export class Request {
    #path: URL;

    #cookies: Record<string, string>;

    #headers: IncomingHttpHeaders;

    #userId: string;

    #method: Method;

    constructor () {
        this.#path = new URL('http://localhost');
        this.#userId = '';
        this.#cookies = {
        };
        this.#headers = {
        };
        this.#method = 'GET';
    }

    get url (): URL {
        return this.#path;
    }

    get method (): Method {
        return this.#method;
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
        request.#method = req.method as Method;
        const cookies = request.#headers.cookie?.split(';') ?? [];

        request.#cookies = Object.fromEntries(cookies.map((cookie) => cookie.split('=')));

        return request;
    }
}

