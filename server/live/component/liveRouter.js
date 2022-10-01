"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveRouter = void 0;
const utils_1 = require("../../utils");
class LiveRouter {
    _response;
    _responseSent;
    _routerType;
    _headers;
    constructor(response, routerType = 'http') {
        this._response = response;
        this._responseSent = false;
        this._headers = {
            pageTitle: undefined,
            flashMessage: undefined,
        };
        if (response instanceof utils_1.PondResponse)
            this._routerType = 'socket';
        else
            this._routerType = routerType;
    }
    /**
     * @desc Sets the page title for the next page
     * @param title - The title of the page
     */
    set pageTitle(title) {
        this._headers.pageTitle = title;
    }
    /**
     * @desc Sets the flash message for the next page
     * @param message - The message to display
     */
    set flashMessage(message) {
        this._headers.flashMessage = message;
    }
    /**
     * @desc Pushes a new page to the client
     * @param path - The path to push
     */
    push(path) {
        if (this._response instanceof utils_1.PondResponse) {
            const message = {
                action: 'push',
                path: path,
            };
            this._sendPondResponse(message, this._response);
        }
        else {
            this._routerType === 'client-router' ?
                this._sendClientRouterResponse('push', path, this._response) :
                this._sendResponse(path, this._response);
        }
    }
    /**
     * @desc Redirects the client to a new page
     * @param path - The path to redirect to
     */
    redirect(path) {
        if (this._response instanceof utils_1.PondResponse) {
            const message = {
                action: 'redirect',
                path: path,
            };
            this._sendPondResponse(message, this._response);
        }
        else {
            this._routerType === 'client-router' ?
                this._sendClientRouterResponse('redirect', path, this._response) :
                this._sendResponse(path, this._response);
        }
    }
    /**
     * @desc Replaces the current page with a new page
     * @param path - The path to replace with
     */
    replace(path) {
        if (this._response instanceof utils_1.PondResponse) {
            const message = {
                action: 'replace',
                path: path,
            };
            this._sendPondResponse(message, this._response);
        }
        else {
            this._routerType === 'client-router' ?
                this._sendClientRouterResponse('replace', path, this._response) :
                this._sendResponse(path, this._response);
        }
    }
    get sentResponse() {
        return this._responseSent;
    }
    get headers() {
        return this._headers;
    }
    _sendResponse(path, response) {
        if (this._responseSent) {
            throw new utils_1.PondError('Response already sent', 500, 'PondLive');
        }
        this._responseSent = true;
        response.writeHead(302, {
            Location: path
        });
        response.end();
    }
    _sendPondResponse(message, response) {
        if (this._responseSent) {
            throw new utils_1.PondError('Response already sent', 500, 'PondLive');
        }
        this._responseSent = true;
        response.send('router', message);
    }
    _sendClientRouterResponse(action, path, response) {
        if (this._responseSent) {
            throw new utils_1.PondError('Response already sent', 500, 'PondLive');
        }
        this._responseSent = true;
        response.setHeader('x-router-action', action);
        response.setHeader('x-router-path', path);
        response.end();
    }
}
exports.LiveRouter = LiveRouter;
