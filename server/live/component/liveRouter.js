"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveRouter = void 0;
var basePromise_1 = require("../../utils/basePromise");
var pondResponse_1 = require("../../utils/pondResponse");
var LiveRouter = /** @class */ (function () {
    function LiveRouter(response, routerType) {
        if (routerType === void 0) { routerType = 'http'; }
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
    Object.defineProperty(LiveRouter.prototype, "pageTitle", {
        set: function (title) {
            this._headers.pageTitle = title;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LiveRouter.prototype, "flashMessage", {
        set: function (message) {
            this._headers.flashMessage = message;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LiveRouter.prototype, "headers", {
        get: function () {
            return this._headers;
        },
        enumerable: false,
        configurable: true
    });
    LiveRouter.prototype.push = function (path) {
        if (this._response instanceof pondResponse_1.PondResponse) {
            var message = {
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
    };
    LiveRouter.prototype.redirect = function (path) {
        if (this._response instanceof pondResponse_1.PondResponse) {
            var message = {
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
    };
    LiveRouter.prototype.replace = function (path) {
        if (this._response instanceof pondResponse_1.PondResponse) {
            var message = {
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
    };
    Object.defineProperty(LiveRouter.prototype, "sentResponse", {
        get: function () {
            return this._responseSent;
        },
        enumerable: false,
        configurable: true
    });
    LiveRouter.prototype._sendResponse = function (path, response) {
        if (this._responseSent) {
            throw new basePromise_1.PondError('Response already sent', 500, 'PondLive');
        }
        this._responseSent = true;
        response.writeHead(302, {
            Location: path
        });
        response.end();
    };
    LiveRouter.prototype._sendPondResponse = function (message, response) {
        if (this._responseSent) {
            throw new basePromise_1.PondError('Response already sent', 500, 'PondLive');
        }
        this._responseSent = true;
        response.send('router', message);
    };
    LiveRouter.prototype._sendClientRouterResponse = function (action, path, response) {
        if (this._responseSent) {
            throw new basePromise_1.PondError('Response already sent', 500, 'PondLive');
        }
        this._responseSent = true;
        response.setHeader('x-router-action', action);
        response.setHeader('x-router-path', path);
        response.end();
    };
    return LiveRouter;
}());
exports.LiveRouter = LiveRouter;
