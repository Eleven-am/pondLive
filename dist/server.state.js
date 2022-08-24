"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerMachine = void 0;
var xstate_1 = require("xstate");
var utils_1 = require("./utils");
var url_1 = require("url");
var ServerMachine = /** @class */ (function () {
    function ServerMachine(context) {
        this.base = new utils_1.BaseClass();
        this.interpreter = this.start(context);
    }
    /**
     * @desc Starts the server machine
     * @param context - The machine context
     * @private
     */
    ServerMachine.prototype.start = function (context) {
        var _this = this;
        var machine = 
        /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlwgBswBiCAe0LPwDc6BrMEtLPQ08qggKtM6AC64GAbQAMAXUSgADnVi4JDRSAAeiAEwyAHCQDsATgBsMgCyWZlgKx6AzABoQAT0TOTJa84BGPRMTAIdbMwczawsAX1j3bhwCYjJKGjAAJ0y6TJIlCnEAM1zULgxkvjTBYTpRDXxZBSQQFTUGrV0EFxkSaMMfC0MHCz1rGRNrdy8EEeMzEL0LAOGTCwtnZ3jEit5UzLB0CA9qWGwAVzF6AHd8LTb1STuWroCZGQdTUYdDGOswwxGabeZwWEiGSbOazhX4yN7OBzbEBJPakA5HE5ZHKZe6qR6aF6IN4uEijOETPSGYZmIGebyTUybMyGAKbAKhWxIlEpNGHY7UdCXbBgfASepgADKdQ4Ylx7SenUQtk+TLMkWhENCemBCACATBzkMFjWgQGbyCJi5ux5JHR-NgSnQtwAovgICoCLKWg8OoSEIDjO89GY9AFoaCHKEdYFfIa3oYXGZAnC4glkdaqoKxMLRbhxbQGJxahxyjwbVmc2LxGAhCw6uInk05fjnqBXjI9HoSPDmYDiZ2Ajqw74Ps53mP9eEaZa09zM0KRVWxBlsrl8oUxCVMmU56kK4u89XayIG9J5M3fW39As+tZxnrIhYnIYzEPI6Y4aGX4bDZykfg6AgOAtF3fh0gvBU-X1Yx9WsSZlUNSY1h1YNfHZEInHsawjT-HYyyqO0ZmUPFLx0RBRmsUlOx+Q0HBWKY6QQABaWwSHsMwVgTWwWQRQwrXw1Jl23AhqwlLJmCyCCCSvXUO16BYn3eGx1hMSkdQcUE+iNIYxw7I0Rn4yo9wXXNxSk1syIQKxjHWBwbE2cYTCNEx1IMcE7IsaFmRDUJDNRczFV1O9u08+DIkQuCLB1JiggCNijR8RwY0WeJ4iAA */
        (0, xstate_1.createMachine)({
            context: context,
            predictableActionArguments: true,
            tsTypes: {},
            schema: { context: {}, events: {} },
            id: "(machine)",
            initial: "idle",
            states: {
                idle: {
                    invoke: {
                        src: "setupServer",
                        onDone: [
                            {
                                target: "ready",
                            },
                        ],
                        onError: [
                            {
                                target: "terminateServer",
                            },
                        ],
                    },
                },
                ready: {
                    on: {
                        shutdown: {
                            target: "terminateServer",
                        },
                        error: {
                            target: "terminateServer",
                        },
                        authenticateSocket: {
                            target: "authenticate",
                        },
                        spawnEndpoint: {
                            actions: "spawnEndpoint",
                        },
                    },
                },
                terminateServer: {
                    entry: "shutDownServer",
                    type: "final",
                },
                authenticate: {
                    invoke: {
                        src: "findEndpoint",
                        onDone: [
                            {
                                actions: "passSocketToEndpoint",
                                target: "ready",
                            },
                        ],
                        onError: [
                            {
                                actions: "rejectRequest",
                                target: "ready",
                            },
                        ],
                    },
                },
            },
        }, {
            actions: {
                passSocketToEndpoint: function (context, event) { return ServerMachine.passSocketToEndpoint(context, event); },
                rejectRequest: function (context, event) { return ServerMachine.rejectRequest(context, event); },
                spawnEndpoint: function (context, event) { return ServerMachine.spawnEndpoint(context, event); },
                shutDownServer: function (context, event) { return _this.shutDownServer(context, event); },
            },
            services: {
                setupServer: function (context, event) { return _this.setupServer(context, event); },
                findEndpoint: function (context, event) { return _this.findEndpoint(context, event); },
            }
        });
        return (0, xstate_1.interpret)(machine).start();
    };
    /**
     * @desc Passes a socket to the endpoint
     * @param ctx - The machine context
     * @param event - The event triggering the action
     */
    ServerMachine.passSocketToEndpoint = function (ctx, event) {
        var _a = event.data, socket = _a.socket, endpointId = _a.endpointId;
        var endpoints = ctx.endpoints;
        var newEndpoint = endpoints.get(endpointId);
        if (newEndpoint === undefined) {
            socket.write("HTTP/1.1 503 Endpoint Not Found\r\n\r\n");
            socket.destroy();
            return;
        }
        newEndpoint.send({
            type: 'authenticateSocket',
            data: event.data
        });
    };
    /**
     * @desc Rejects a socket request
     * @param _ctx - The machine context
     * @param event - The event triggering the action
     */
    ServerMachine.rejectRequest = function (_ctx, event) {
        event.data.data.write("HTTP/1.1 " + event.data.errorCode + " " + event.data.errorMessage + "\r\n\r\n");
        event.data.data.destroy();
    };
    /**
     * @desc Shuts down the server
     * @param ctx - The machine context
     * @param event - The event triggering the action
     */
    ServerMachine.prototype.shutDownServer = function (ctx, event) {
        ctx.socketServer.clients.forEach(function (client) { return client.terminate(); });
        ctx.socketServer.close();
        ctx.server.close();
        this.interpreter.stop();
        console.log("Server shut down", event.data);
        process.exit(0);
    };
    /**
     * @desc Spawns a new endpoint
     * @param ctx - The machine context
     * @param event - The event triggering the action
     */
    ServerMachine.spawnEndpoint = function (ctx, event) {
        var _a = event.data, endpoint = _a.endpoint, path = _a.path, endpointId = _a.endpointId;
        var paths = ctx.paths, endpoints = ctx.endpoints;
        (0, xstate_1.assign)({
            paths: new utils_1.BaseMap(paths.set(endpointId, path)),
            endpoints: new utils_1.BaseMap(endpoints.set(endpointId, endpoint)),
        });
    };
    /**
     * @desc sets up the server
     * @param ctx - The machine context
     * @param _event - The event triggering the action
     */
    ServerMachine.prototype.setupServer = function (ctx, _event) {
        var _this = this;
        return (0, utils_1.BasePromise)(function (resolve, reject) {
            ctx.server.on('upgrade', function (request, socket, head) {
                _this.interpreter.send({
                    type: 'authenticateSocket',
                    data: {
                        request: request,
                        head: head,
                        socket: socket,
                    }
                });
            });
            ctx.server.on('error', function (error) {
                return reject('Error: ', 500, error.message);
            });
            ctx.server.on('listening', function () {
                _this.pingClients(ctx.socketServer);
                return resolve();
            });
        }, 'setupServer');
    };
    /**
     * @desc finds the endpoint for the socket
     * @param ctx - The machine context
     * @param event - The event triggering the action
     */
    ServerMachine.prototype.findEndpoint = function (ctx, event) {
        var _this = this;
        return (0, utils_1.BasePromise)(function (resolve, reject) {
            var pathname = (0, url_1.parse)(event.data.request.url || '').pathname;
            if (!pathname)
                return reject('No pathname found', 404, event.data.socket);
            var endpoint = ctx.paths.find(function (endpoint) { return _this.base.compareStringToPattern(pathname, endpoint); });
            if (endpoint) {
                resolve({
                    endpointId: endpoint.key,
                    endpoint: pathname,
                    socket: event.data.socket,
                    request: event.data.request,
                    head: event.data.head,
                });
            }
            else
                return reject('Unable to resolve endpoint', 404, event.data.socket);
        }, event.data.socket);
    };
    /**
     * @desc Makes sure that every client is still connected to the pond
     * @param server - WebSocket server
     */
    ServerMachine.prototype.pingClients = function (server) {
        server.on('connection', function (ws) {
            ws.isAlive = true;
            ws.on('pong', function () {
                ws.isAlive = true;
            });
        });
        var interval = setInterval(function () {
            server.clients.forEach(function (ws) {
                if (ws.isAlive === false)
                    return ws.terminate();
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000);
        server.on('close', function () { return clearInterval(interval); });
    };
    return ServerMachine;
}());
exports.ServerMachine = ServerMachine;
