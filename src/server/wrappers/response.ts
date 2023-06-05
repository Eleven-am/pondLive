import { OutgoingHttpHeaders, ServerResponse } from 'http';

export enum PondLiveHeaders {
    LIVE_USER_ID = 'x-pond-live-user-id',
    LIVE_ROUTER = 'x-pond-live-router',
    LIVE_PAGE_TITLE = 'x-pond-live-page-title',
    LIVE_ROUTER_ACTION = 'x-pond-live-router-action',
}

interface CookieOptions {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: boolean | 'lax' | 'strict' | 'none';
    secure?: boolean;
    signed?: boolean;
}

export class Response {
    readonly #response: ServerResponse;

    readonly #headers: OutgoingHttpHeaders;

    #statusCode: number;

    #responseSent: boolean;

    constructor (response: ServerResponse) {
        this.#headers = {};
        this.#statusCode = 200;
        this.#response = response;
        this.#responseSent = false;
    }

    get response (): ServerResponse {
        return this.#response;
    }

    status (code: number): Response {
        this.#statusCode = code;

        return this;
    }

    setHeader (name: string, value: string): Response {
        if (this.#responseSent) {
            throw new Error('Cannot set headers after response is sent');
        }

        this.#headers[name] = value;

        return this;
    }

    setCookie (name: string, value: string, options?: CookieOptions): Response {
        this.setHeader('set-cookie', `${name}=${value}`);

        if (options) {
            if (options.domain) {
                this.setHeader('set-cookie', `Domain=${options.domain}`);
            }

            if (options.expires) {
                this.setHeader('set-cookie', `Expires=${options.expires}`);
            }

            if (options.httpOnly) {
                this.setHeader('set-cookie', `HttpOnly=${options.httpOnly}`);
            }

            if (options.maxAge) {
                this.setHeader('set-cookie', `Max-Age=${options.maxAge}`);
            }

            if (options.path) {
                this.setHeader('set-cookie', `Path=${options.path}`);
            }

            if (options.sameSite) {
                this.setHeader('set-cookie', `SameSite=${options.sameSite}`);
            }

            if (options.secure) {
                this.setHeader('set-cookie', `Secure=${options.secure}`);
            }

            if (options.signed) {
                this.setHeader('set-cookie', `Signed=${options.signed}`);
            }
        }

        return this;
    }

    setPageTitle (title: string) {
        return this.setHeader(PondLiveHeaders.LIVE_PAGE_TITLE, title);
    }

    navigateTo (url: string) {
        return this.setHeader('x-router-action', `redirect:${url}`);
    }

    html (html: string): void {
        this.setHeader('content-type', 'text/html');
        this.#response.writeHead(this.#statusCode, this.#headers);
        this.#response.end(html);
        this.#responseSent = true;
    }

    json (json: object): void {
        this.setHeader('content-type', 'application/json');
        this.#response.writeHead(this.#statusCode, this.#headers);
        this.#response.end(JSON.stringify(json));
        this.#responseSent = true;
    }

    replace (address: string) {
        return this.setHeader('x-router-action', `replace:${address}`);
    }

    get (header: PondLiveHeaders) {
        return this.#headers[header];
    }
}
