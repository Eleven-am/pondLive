"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
var baseClass_1 = require("../utils/baseClass");
var http_1 = require("http");
var ws_1 = require("ws");
var pondBase_1 = require("../utils/pondBase");
var endpoint_1 = require("./endpoint");
var basePromise_1 = require("../utils/basePromise");
var Server = /** @class */ (function (_super) {
    __extends(Server, _super);
    function Server(server, socketServer) {
        var _this = _super.call(this) || this;
        _this._server = server || new http_1.Server();
        _this._socketServer = socketServer || new ws_1.WebSocketServer({ noServer: true });
        _this._endpoints = new pondBase_1.PondBase();
        _this._init();
        return _this;
    }
    /**
     * @desc Rejects the client's connection
     * @param error - Reason for rejection
     */
    Server._rejectClient = function (error) {
        var errorMessage = error.errorMessage, errorCode = error.errorCode, socket = error.data;
        socket.write("HTTP/1.1 " + errorCode + " " + errorMessage + "\r\n\r\n");
        socket.destroy();
    };
    /**
     * @desc Specifies the port to listen on
     * @param port - the port to listen on
     * @param callback - the callback to call when the server is listening
     */
    Server.prototype.listen = function (port, callback) {
        return this._server.listen(port, callback);
    };
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
    Server.prototype.createEndpoint = function (path, handler) {
        var endpoint = new endpoint_1.Endpoint(path, this._socketServer, handler);
        this._endpoints.set(endpoint);
        return endpoint;
    };
    /**
     * @desc Makes sure that every client is still connected to the pond
     * @param server - WebSocket server
     */
    Server.prototype._pingClients = function (server) {
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
    /**
     * @desc Initializes the server
     */
    Server.prototype._init = function () {
        var _this = this;
        this._server.on('upgrade', function (request, socket, head) {
            _this._handleUpgrade(request, socket, head);
        });
        this._server.on('error', function (error) {
            _this._close();
            throw new basePromise_1.PondError('Server error', 500, { error: error });
        });
        this._server.on('listening', function () {
            _this._pingClients(_this._socketServer);
        });
        this._server.on('close', function () {
            _this._close();
        });
    };
    /**
     * @desc Shuts down the server
     * @private
     */
    Server.prototype._close = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this._endpoints.generate()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var endpoint = _c.value;
                endpoint.close();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    /**
     * @desc Handles the upgrade request
     * @param request - The request to upgrade
     * @param socket - The socket to upgrade
     * @param head - The head of the request
     * @private
     */
    Server.prototype._handleUpgrade = function (request, socket, head) {
        var _this = this;
        var address = request.url || '';
        var doc = this._endpoints.reduce(function (acc, data) {
            var dataEndpoint = _this.generateEventRequest(data.path, address);
            if (dataEndpoint)
                return {
                    data: dataEndpoint,
                    endpoint: data
                };
            return acc;
        }, null);
        if (doc)
            doc.endpoint.authoriseConnection(request, socket, head, doc.data)
                .catch(function (error) { return Server._rejectClient(error); });
        else {
            var error = new basePromise_1.PondError('Not found', 404, socket);
            Server._rejectClient(error);
        }
    };
    return Server;
}(baseClass_1.BaseClass));
exports.Server = Server;
