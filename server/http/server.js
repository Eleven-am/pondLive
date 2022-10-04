"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondServer = void 0;
var http_1 = require("http");
var middleWare_1 = require("./helpers/middlewares/middleWare");
var socket_1 = require("../socket");
var fileRouter_1 = require("./helpers/server/fileRouter");
var auth_1 = require("./helpers/auth");
var bodyParser_1 = require("./helpers/server/bodyParser");
var cors_1 = require("./helpers/server/cors");
var live_1 = require("../live");
var verbHandler_1 = require("./verbs/verbHandler");
var PondServer = /** @class */ (function () {
    function PondServer() {
        this._server = (0, http_1.createServer)();
        this._middlewareChain = new middleWare_1.MiddleWare(this._server);
        this._pondSocket = new socket_1.PondSocket(this._server);
    }
    PondServer.prototype.listen = function (port, callback) {
        this._server.listen(port, callback);
    };
    PondServer.prototype.use = function (middleware) {
        this._middlewareChain.use(middleware);
    };
    PondServer.prototype.get = function (path, callback) {
        (0, verbHandler_1.VerbHandler)(this._middlewareChain, path, 'GET', callback);
    };
    PondServer.prototype.post = function (path, callback) {
        (0, verbHandler_1.VerbHandler)(this._middlewareChain, path, 'POST', callback);
    };
    PondServer.prototype.put = function (path, callback) {
        (0, verbHandler_1.VerbHandler)(this._middlewareChain, path, 'PUT', callback);
    };
    PondServer.prototype.delete = function (path, callback) {
        (0, verbHandler_1.VerbHandler)(this._middlewareChain, path, 'DELETE', callback);
    };
    PondServer.prototype.patch = function (path, callback) {
        (0, verbHandler_1.VerbHandler)(this._middlewareChain, path, 'PATCH', callback);
    };
    PondServer.prototype.upgrade = function (path, handler) {
        this._pondSocket.createEndpoint(path, handler);
    };
    PondServer.prototype.useStatic = function (path) {
        var handler = (0, fileRouter_1.FileRouter)(path);
        this.use(handler);
    };
    PondServer.prototype.useAuthenticator = function (secret, cookieName) {
        if (cookieName === void 0) { cookieName = 'authorization'; }
        var authenticator = (0, auth_1.AuthenticateRequest)(secret, cookieName);
        var socketAuthenticator = (0, auth_1.AuthenticateUpgrade)(secret, cookieName);
        this._pondSocket.useOnUpgrade(socketAuthenticator);
        this.use(authenticator);
    };
    PondServer.prototype.useBodyParser = function () {
        var bodyParser = (0, bodyParser_1.BodyParserMiddleware)();
        var JSONParser = (0, bodyParser_1.JsonBodyParserMiddleware)();
        this.use(bodyParser);
        this.use(JSONParser);
    };
    PondServer.prototype.useCors = function () {
        var handler = (0, cors_1.CorsMiddleware)();
        this.use(handler);
    };
    PondServer.prototype.usePondLive = function (routes, options) {
        if (options === void 0) { options = {}; }
        var data = (0, live_1.GenerateLiveServer)(routes, this._server, this._middlewareChain, {
            pondSocket: this._pondSocket,
            htmlPath: options.index,
            secret: options.secret,
            cookie: options.cookie
        });
        return data.manager;
    };
    return PondServer;
}());
exports.PondServer = PondServer;
