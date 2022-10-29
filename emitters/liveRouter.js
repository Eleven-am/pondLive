"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveRouter = void 0;
const pondsocket_1 = require("@eleven-am/pondsocket");
class LiveRouter {
    constructor(response, routerType = 'http') {
        this._response = response;
        this._headers = {
            pageTitle: undefined,
            flashMessage: undefined,
        };
        if (response instanceof pondsocket_1.PondResponse) {
            this._responseSent = false;
            this._routerType = 'socket';
        }
        else {
            this._routerType = routerType;
            this._responseSent = response.headersSent;
        }
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
    get sentResponse() {
        return this._responseSent;
    }
    get headers() {
        return this._headers;
    }
    /**
     * @desc Navigates the client to a new page
     * @param path - The path to navigate to
     */
    navigateTo(path) {
        if (this._response instanceof pondsocket_1.PondResponse) {
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
        if (this._response instanceof pondsocket_1.PondResponse) {
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
    /**
     * @desc Reloads the current page, only works if the client is already rendered
     */
    reload() {
        if (this._response instanceof pondsocket_1.PondResponse) {
            const message = {
                action: 'reload',
                path: 'current',
            };
            this._sendPondResponse(message, this._response);
        }
    }
    _sendResponse(path, response) {
        if (this._responseSent)
            throw new Error('Response already sent');
        this._responseSent = true;
        response.redirect(path);
    }
    _sendPondResponse(message, response) {
        if (this._responseSent)
            throw new Error('Response already sent');
        this._responseSent = true;
        response.send('router', message);
    }
    _sendClientRouterResponse(action, path, response) {
        if (this._responseSent)
            throw new Error('Response already sent');
        this._responseSent = true;
        response.setHeader('x-router-action', action);
        response.setHeader('x-router-path', path);
        response.end();
    }
}
exports.LiveRouter = LiveRouter;
