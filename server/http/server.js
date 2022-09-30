"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondServer = void 0;
const http_1 = require("http");
const middleWare_1 = require("./helpers/middlewares/middleWare");
const socket_1 = require("../socket");
const fileRouter_1 = require("./helpers/server/fileRouter");
const auth_1 = require("./helpers/auth");
const bodyParser_1 = require("./helpers/server/bodyParser");
const cors_1 = require("./helpers/server/cors");
const live_1 = require("../live");
const verbHandler_1 = require("./verbs/verbHandler");
class PondServer {
    _server;
    _middlewareChain;
    _pondSocket;
    constructor() {
        this._server = (0, http_1.createServer)();
        this._middlewareChain = new middleWare_1.MiddleWare(this._server);
        this._pondSocket = new socket_1.PondSocket(this._server);
    }
    listen(port, callback) {
        this._server.listen(port, callback);
    }
    use(middleware) {
        this._middlewareChain.use(middleware);
    }
    get(path, callback) {
        (0, verbHandler_1.VerbHandler)(this._middlewareChain, path, 'GET', callback);
    }
    post(path, callback) {
        (0, verbHandler_1.VerbHandler)(this._middlewareChain, path, 'POST', callback);
    }
    put(path, callback) {
        (0, verbHandler_1.VerbHandler)(this._middlewareChain, path, 'PUT', callback);
    }
    delete(path, callback) {
        (0, verbHandler_1.VerbHandler)(this._middlewareChain, path, 'DELETE', callback);
    }
    patch(path, callback) {
        (0, verbHandler_1.VerbHandler)(this._middlewareChain, path, 'PATCH', callback);
    }
    upgrade(path, handler) {
        this._pondSocket.createEndpoint(path, handler);
    }
    useStatic(path) {
        const handler = (0, fileRouter_1.FileRouter)(path);
        this.use(handler);
    }
    useAuthenticator(secret, cookieName = 'authorization') {
        const authenticator = (0, auth_1.AuthenticateRequest)(secret, cookieName);
        const socketAuthenticator = (0, auth_1.AuthenticateUpgrade)(secret, cookieName);
        this._pondSocket.useOnUpgrade(socketAuthenticator);
        this.use(authenticator);
    }
    useBodyParser() {
        const bodyParser = (0, bodyParser_1.BodyParserMiddleware)();
        const JSONParser = (0, bodyParser_1.JsonBodyParserMiddleware)();
        this.use(bodyParser);
        this.use(JSONParser);
    }
    useCors() {
        const handler = (0, cors_1.CorsMiddleware)();
        this.use(handler);
    }
    usePondLive(routes, htmlPath) {
        (0, live_1.GenerateLiveServer)(routes, this._server, this._middlewareChain, {
            pondSocket: this._pondSocket,
            htmlPath: htmlPath
        });
    }
}
exports.PondServer = PondServer;
