"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondSocket = void 0;
const http_1 = require("http");
const ws_1 = require("ws");
const endpoint_1 = require("./endpoint");
const utils_1 = require("../utils");
const http_2 = require("../http");
class PondSocket extends utils_1.BaseClass {
    _server;
    _socketServer;
    _endpoints;
    _socketChain;
    constructor(server, socketServer) {
        super();
        this._server = server || new http_1.Server();
        this._socketServer = socketServer || new ws_1.WebSocketServer({ noServer: true });
        this._endpoints = new utils_1.PondBase();
        this._socketChain = new http_2.SocketMiddleWare(this._server);
        this._init();
    }
    /**
     * @desc Rejects the client's connection
     * @param error - Reason for rejection
     */
    static _rejectClient(error) {
        const { errorMessage, errorCode, data: socket } = error;
        socket.write(`HTTP/1.1 ${errorCode} ${errorMessage}\r\n\r\n`);
        socket.destroy();
    }
    /**
     * @desc Specifies the port to listen on
     * @param port - the port to listen on
     * @param callback - the callback to call when the server is listening
     */
    listen(port, callback) {
        return this._server.listen(port, callback);
    }
    /**
     * @desc adds a middleware to the server
     * @param middleware - the middleware to add
     */
    useOnUpgrade(middleware) {
        this._socketChain.use(middleware);
    }
    /**
     * @desc Accepts a new socket upgrade request on the provided endpoint using the handler function to authenticate the socket
     * @param path - the pattern to accept || can also be a regex
     * @param handler - the handler function to authenticate the socket
     *
     * @example
     * const endpoint = pond.createEndpoint('/api/socket', (req, res) => {
     *    const { query } = parse(req.url || '');
     *    const { token } = query;
     *    if (!token)
     *       return res.reject('No token provided');
     *    res.accept({
     *       assign: {
     *           token
     *       }
     *    });
     * })
     */
    createEndpoint(path, handler) {
        const endpoint = new endpoint_1.Endpoint(this._socketServer, handler);
        this._socketChain.use(async (req, socket, head, next) => {
            const address = req.url || '';
            const dataEndpoint = this.generateEventRequest(path, address);
            if (!dataEndpoint)
                return next();
            endpoint.authoriseConnection(req, socket, head, dataEndpoint)
                .catch(error => PondSocket._rejectClient(error));
        });
        return endpoint;
    }
    /**
     * @desc Makes sure that every client is still connected to the pond
     * @param server - WebSocket server
     */
    _pingClients(server) {
        server.on('connection', (ws) => {
            ws.isAlive = true;
            ws.on('pong', () => {
                ws.isAlive = true;
            });
        });
        const interval = setInterval(() => {
            server.clients.forEach((ws) => {
                if (ws.isAlive === false)
                    return ws.terminate();
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000);
        server.on('close', () => clearInterval(interval));
    }
    /**
     * @desc Initializes the server
     */
    _init() {
        this._server.on('error', (error) => {
            this._close();
            throw new utils_1.PondError('Server error', 500, { error });
        });
        this._server.on('listening', () => {
            this._pingClients(this._socketServer);
        });
        this._server.on('close', () => {
            this._close();
        });
    }
    /**
     * @desc Shuts down the server
     * @private
     */
    _close() {
        for (const endpoint of this._endpoints.generate()) {
            endpoint.close();
        }
    }
}
exports.PondSocket = PondSocket;
