"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveRouter = void 0;
const basePromise_1 = require("../../utils/basePromise");
const pondResponse_1 = require("../../utils/pondResponse");
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
        if (response instanceof pondResponse_1.PondResponse)
            this._routerType = 'socket';
        else
            this._routerType = routerType;
    }
    set pageTitle(title) {
        this._headers.pageTitle = title;
    }
    set flashMessage(message) {
        this._headers.flashMessage = message;
    }
    get headers() {
        return this._headers;
    }
    push(path) {
        if (this._response instanceof pondResponse_1.PondResponse) {
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
    redirect(path) {
        if (this._response instanceof pondResponse_1.PondResponse) {
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
    replace(path) {
        if (this._response instanceof pondResponse_1.PondResponse) {
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
    _sendResponse(path, response) {
        if (this._responseSent) {
            throw new basePromise_1.PondError('Response already sent', 500, 'PondLive');
        }
        this._responseSent = true;
        response.writeHead(302, {
            Location: path
        });
        response.end();
    }
    _sendPondResponse(message, response) {
        if (this._responseSent) {
            throw new basePromise_1.PondError('Response already sent', 500, 'PondLive');
        }
        this._responseSent = true;
        response.send('router', message);
    }
    _sendClientRouterResponse(action, path, response) {
        if (this._responseSent) {
            throw new basePromise_1.PondError('Response already sent', 500, 'PondLive');
        }
        this._responseSent = true;
        response.setHeader('x-router-action', action);
        response.setHeader('x-router-path', path);
        response.end();
    }
}
exports.LiveRouter = LiveRouter;
