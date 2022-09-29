"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondServer = void 0;
const http_1 = require("http");
const pondSocket_1 = require("../socket/pondSocket");
const genServer_1 = require("../live/genServer");
const verbs_1 = require("./verbs");
const helpers_1 = require("./helpers");
class PondServer {
    _server;
    _middlewareChain;
    _pondSocket;
    constructor() {
        this._server = (0, http_1.createServer)();
        this._middlewareChain = new helpers_1.MiddleWare(this._server);
        this._pondSocket = new pondSocket_1.PondSocket(this._server);
    }
    listen(port, callback) {
        this._server.listen(port, callback);
    }
    use(middleware) {
        this._middlewareChain.use(middleware);
    }
    get(path, callback) {
        (0, verbs_1.VerbHandler)(this._middlewareChain, path, 'GET', callback);
    }
    post(path, callback) {
        (0, verbs_1.VerbHandler)(this._middlewareChain, path, 'POST', callback);
    }
    put(path, callback) {
        (0, verbs_1.VerbHandler)(this._middlewareChain, path, 'PUT', callback);
    }
    delete(path, callback) {
        (0, verbs_1.VerbHandler)(this._middlewareChain, path, 'DELETE', callback);
    }
    patch(path, callback) {
        (0, verbs_1.VerbHandler)(this._middlewareChain, path, 'PATCH', callback);
    }
    upgrade(path, handler) {
        this._pondSocket.createEndpoint(path, handler);
    }
    useStatic(path) {
        const handler = (0, helpers_1.FileRouter)(path);
        this.use(handler);
    }
    useAuthenticator(secret, cookieName = 'authorization') {
        const authenticator = (0, helpers_1.AuthenticateRequest)(secret, cookieName);
        const socketAuthenticator = (0, helpers_1.AuthenticateUpgrade)(secret, cookieName);
        this._pondSocket.useOnUpgrade(socketAuthenticator);
        this.use(authenticator);
    }
    useBodyParser() {
        const bodyParser = (0, helpers_1.BodyParserMiddleware)();
        const JSONParser = (0, helpers_1.JsonBodyParserMiddleware)();
        this.use(bodyParser);
        this.use(JSONParser);
    }
    useCors() {
        const handler = (0, helpers_1.CorsMiddleware)();
        this.use(handler);
    }
    usePondLive(routes, htmlPath) {
        (0, genServer_1.GenerateLiverServer)(routes, this._server, this._middlewareChain, {
            pondSocket: this._pondSocket,
            htmlPath: htmlPath
        });
    }
}
exports.PondServer = PondServer;
