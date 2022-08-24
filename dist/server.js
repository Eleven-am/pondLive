"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var ws_1 = require("ws");
var utils_1 = require("./utils");
var server_state_1 = require("./server.state");
var endpoint_state_1 = require("./endpoint.state");
var endpoint_1 = __importDefault(require("./endpoint"));
var rxjs_1 = require("rxjs");
var xstate_1 = require("xstate");
var PondServer = /** @class */ (function () {
    function PondServer(server, socketServer) {
        this.utils = new utils_1.BaseClass();
        this.server = server || new http_1.Server();
        this.socketServer = socketServer || new ws_1.WebSocketServer({ noServer: true });
        this.machine = new server_state_1.ServerMachine({
            server: this.server,
            socketServer: this.socketServer,
            paths: new utils_1.BaseMap(),
            connections: new utils_1.BaseMap(),
            endpoints: new utils_1.BaseMap(),
        }).interpreter;
    }
    /**
     * @desc Specifies the port to listen on
     * @param port - the port to listen on
     * @param callback - the callback to call when the server is listening
     */
    PondServer.prototype.listen = function (port, callback) {
        return this.server.listen(port, callback);
    };
    /**
     * @desc Accepts a new socket upgrade request on the provided endpoint using the handler function to authenticate the socket
     * @param path - the pattern to accept || can also be a regex
     * @param handler - the handler function to authenticate the socket
     *
     * @example
     * const endpoint = pond.createEndpoint('/api/v1/auth', (req, res) => {
     *    const { query } = parse(req.url || '');
     *    const { token } = query;
     *    if (!token)
     *        return res.decline('No token provided');
     *
     *    res.accept({ token });
     * })
     */
    PondServer.prototype.createEndpoint = function (path, handler) {
        var endpointId = this.utils.uuid();
        var generateEndpoint = new endpoint_state_1.EndpointMachine({
            handler: handler,
            channels: new utils_1.BaseMap(),
            socketServer: this.socketServer,
            authorizers: new utils_1.BaseMap(),
            observable: new rxjs_1.Subject(),
            server: this.server,
        }, endpointId).interpreter;
        var context = this.machine.state.context;
        (0, xstate_1.assign)({
            paths: new utils_1.BaseMap(context.paths.set(endpointId, path)),
            endpoints: new utils_1.BaseMap(context.endpoints.set(endpointId, generateEndpoint))
        });
        return new endpoint_1.default(generateEndpoint);
    };
    return PondServer;
}());
exports.default = PondServer;
