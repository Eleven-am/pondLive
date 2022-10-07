import {PondMessage, PondResponse} from "../../pondsocket";
import {PondError} from "../../pondbase";
import {PondHTTPResponse} from "../../pondserver";

type Response = PondHTTPResponse | PondResponse;
type RouterType = 'http' | 'socket' | 'client-router';
type ClientRouterAction = 'replace' | 'redirect';

export type RouterHeaders = {
    pageTitle: string | undefined;
    flashMessage: string | undefined;
}

export class LiveRouter {
    private readonly _response: Response;
    private _responseSent: boolean;
    private readonly _routerType: RouterType;
    private readonly _headers: RouterHeaders;

    constructor(response: Response, routerType: RouterType = 'http') {
        this._response = response;
        this._responseSent = false;
        this._headers = {
            pageTitle: undefined,
            flashMessage: undefined,
        };
        if (response instanceof PondResponse)
            this._routerType = 'socket';
        else
            this._routerType = routerType;
    }

    /**
     * @desc Sets the page title for the next page
     * @param title - The title of the page
     */
    set pageTitle(title: string) {
        this._headers.pageTitle = title;
    }

    /**
     * @desc Sets the flash message for the next page
     * @param message - The message to display
     */
    set flashMessage(message: string) {
        this._headers.flashMessage = message;
    }

    get sentResponse(): boolean {
        return this._responseSent;
    }

    get headers(): RouterHeaders {
        return this._headers;
    }

    /**
     * @desc Navigates the client to a new page
     * @param path - The path to navigate to
     */
    navigateTo(path: string): Promise<void> | void {
        if (this._response instanceof PondResponse) {
            const message = {
                action: 'redirect',
                path: path,
            }

            this._sendPondResponse(message, this._response);
        } else {
            this._routerType === 'client-router' ?
                this._sendClientRouterResponse('redirect', path, this._response) :
                this._sendResponse(path, this._response);
        }
    }

    /**
     * @desc Replaces the current page with a new page
     * @param path - The path to replace with
     */
    replace(path: string): Promise<void> | void {
        if (this._response instanceof PondResponse) {
            const message = {
                action: 'replace',
                path: path,
            }

            this._sendPondResponse(message, this._response);
        } else {
            this._routerType === 'client-router' ?
                this._sendClientRouterResponse('replace', path, this._response) :
                this._sendResponse(path, this._response);
        }
    }

    private _sendResponse(path: string, response: PondHTTPResponse): void {
        if (this._responseSent)
            throw new PondError('Response already sent', 500, 'PondLive');

        this._responseSent = true;
        response.redirect(path);
    }

    private _sendPondResponse(message: PondMessage, response: PondResponse): void {
        if (this._responseSent)
            throw new PondError('Response already sent', 500, 'PondLive');

        this._responseSent = true;
        response.send('router', message);
    }

    private _sendClientRouterResponse(action: ClientRouterAction, path: string, response: PondHTTPResponse): void {
        if (this._responseSent)
            throw new PondError('Response already sent', 500, 'PondLive');

        this._responseSent = true;
        response.setHeader('x-router-action', action);
        response.setHeader('x-router-path', path);
        response.end();
    }
}
