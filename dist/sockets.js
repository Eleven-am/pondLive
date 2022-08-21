"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondSocket = void 0;
var http_1 = require("http");
var ws_1 = require("ws");
var xstate_1 = require("xstate");
var channels_1 = require("./channels");
var base_1 = require("./base");
var url_1 = require("url");
var PondSocket = /** @class */ (function () {
    function PondSocket(server, wss) {
        this._base = new base_1.BaseClass();
        this._paths = [];
        this._server = server || (0, http_1.createServer)();
        this._wss = wss || new ws_1.WebSocketServer({ noServer: true });
        this.init();
    }
    /**
     * @desc declines an authenticated socket from the pond
     * @param event - the event that is being handled
     * @private
     */
    PondSocket.rejectSocketConnection = function (event) {
        event.data.data.write("HTTP/1.1 " + event.data.errorCode + " " + event.data.errorMessage + "\r\n\r\n");
        event.data.data.destroy();
    };
    /**
     * @desc rejects a socket connection to the room provided
     * @param event - the event that is being handled
     * @private
     */
    PondSocket.sendErrorMessage = function (event) {
        var message = {
            topic: "JOIN_ROOM_RESPONSE",
            channel: event.data.data.room,
            payload: {
                status: "failure",
                response: {
                    error: event.data.errorMessage
                }
            }
        };
        event.data.data.socket.send(JSON.stringify(message));
    };
    /**
     * @desc compares string to string | regex
     * @param string - the string to compare to the pattern
     * @param pattern - the pattern to compare to the string
     */
    PondSocket.compareStringToPattern = function (string, pattern) {
        if (typeof pattern === 'string')
            return string === pattern;
        else {
            return pattern.test(string);
        }
    };
    /**
     * @desc Specifies the port to listen on
     * @param port - the port to listen on
     * @param callback - the callback to call when the server is listening
     */
    PondSocket.prototype.listen = function (port, callback) {
        return this._server.listen(port, callback);
    };
    /**
     * @desc Accepts a new socket upgrade request on the provided endpoint using the handler function to authenticate the socket
     * @param pattern - the pattern to accept || can also be a regex
     * @param handler - the handler function to authenticate the socket
     *
     * @example
     * const endpoint = pond.createEndpoint('/api/v1/auth', ({request, accept, decline}) => {
     *    const { query } = parse(request.url || '');
     *    const { token } = query;
     *    if (!token)
     *        return decline('No token provided');
     *
     *    accept({ token });
     * })
     */
    PondSocket.prototype.createEndpoint = function (pattern, handler) {
        var _this = this;
        var newEndpoint = {
            pattern: pattern,
            handler: handler,
            rooms: [],
        };
        this._paths.push(newEndpoint);
        console.log(this._paths);
        return {
            /**
             * @desc Accepts a new socket join request to the room provided using the handler function to authorise the socket
             * @param pattern - the pattern to accept || can also be a regex
             * @param handler - the handler function to authenticate the socket
             *
             * @example
             * const room = endpoint.createRoom('room:*', ({request, accept, decline}) => {
             *   const isAdmin = request.assigns.admin;
             *   if (!isAdmin)
             *      return decline('You are not an admin');
             *
             *   accept({assigns: {admin: true, joinedDate: new Date()}, presence: {state: online}, roomData: {private: true}});
             * });
             *
             * room.on('ping', ({assigns, roomData, assign}) => {
             *     assign({pingDate: new Date()});
             *     return true;
             * })
             */
            createRoom: function (pattern, handler) {
                return _this.createRoom(newEndpoint, pattern, handler);
            }
        };
    };
    /**
     * @desc Accepts a new socket join request to the room provided using the handler function to authorise the socket
     * @param endpoint - the endpoint to accept the socket on
     * @param pattern - the pattern to accept || can also be a regex
     * @param handler - the handler function to authenticate the socket
     * @private
     */
    PondSocket.prototype.createRoom = function (endpoint, pattern, handler) {
        var _a;
        var events = new Map();
        var channels = ((_a = this._interpreter) === null || _a === void 0 ? void 0 : _a.state.context.channels) || new Map();
        endpoint.rooms.push({ pattern: pattern, handler: handler, events: events });
        return {
            /**
             * @desc Adds an event listener to the channel
             * @param event - the event to listen for
             * @param callback - the callback to call when the event is triggered
             */
            on: function (event, callback) {
                events.set(event, callback);
            },
            /**
             * @desc Broadcasts an event to all clients in the room
             * @param roomName - the name of the room to broadcast to
             * @param event - the event to broadcast
             * @param data - the data to broadcast
             */
            broadcast: function (roomName, event, data) {
                var channel = channels.get(roomName);
                if (channel)
                    channel.room.broadcast(event, data);
            },
            /**
             * @desc Broadcasts an event to all clients in the room except the clientId provided
             * @param roomName - the name of the room to broadcast to
             * @param clientId - the clientId to exclude from the broadcast
             * @param event - the event to broadcast
             * @param data - the data to broadcast
             */
            broadcastFrom: function (roomName, clientId, event, data) {
                var channel = channels.get(roomName);
                if (channel)
                    channel.broadcastFrom(clientId, event, data);
            },
            /**
             * @desc Sends an event to the clientId provided
             * @param roomName - the name of the room to broadcast to
             * @param clientId - the clientId to send the event to
             * @param event - the event to broadcast
             * @param data - the data to broadcast
             */
            send: function (roomName, clientId, event, data) {
                var channel = channels.get(roomName);
                if (channel)
                    channel.privateMessage(clientId, event, data);
            },
            /**
             * @desc Gets the list of clients in the channel
             * @param roomName - the name of the room to get the clients from
             */
            getPresenceList: function (roomName) {
                var channel = channels.get(roomName);
                return (channel === null || channel === void 0 ? void 0 : channel.presenceList) || [];
            },
            /**
             * @desc Gets the metadata of the channel
             * @param roomName
             */
            getRoomData: function (roomName) {
                var channel = channels.get(roomName);
                return (channel === null || channel === void 0 ? void 0 : channel.roomData) || {};
            },
            /**
             * @desc Disconnects the client from the channel
             * @param roomName - the name of the room to disconnect from
             * @param clientId - the clientId to disconnect
             */
            disconnect: function (roomName, clientId) {
                var channel = channels.get(roomName);
                if (channel)
                    channel.removeSocket(clientId);
            }
        };
    };
    /**
     * @desc initializes the pond socket service
     * @private
     */
    PondSocket.prototype.init = function () {
        var _this = this;
        var stateMachine = (0, xstate_1.createMachine)({
            tsTypes: {},
            schema: {
                context: {},
                events: {},
                services: {},
            },
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
                        requestToJoinRoom: {
                            target: "lobby",
                        },
                        newUpgradeRequest: {
                            target: "authoriser",
                        },
                    },
                },
                terminateServer: {
                    entry: "shutDownServer",
                    type: "final",
                },
                lobby: {
                    invoke: {
                        src: "authenticateRoom",
                        onDone: [
                            {
                                actions: "joinRoom",
                                target: "ready",
                            },
                        ],
                        onError: [
                            {
                                actions: "sendErrorMessage",
                                target: "ready",
                            },
                        ],
                    },
                },
                authoriser: {
                    invoke: {
                        src: "authenticateSocket",
                        onDone: [
                            {
                                actions: "addSocketToDB",
                                target: "ready",
                            },
                        ],
                        onError: [
                            {
                                actions: "rejectSocketConnection",
                                target: "ready",
                            },
                        ],
                    },
                },
            },
            context: {
                channels: new Map(),
                sockets: new Map(),
            },
            predictableActionArguments: true,
            id: "globalSockets",
            initial: "idle",
        }, {
            actions: {
                sendErrorMessage: function (_ctx, event) { return PondSocket.sendErrorMessage(event); },
                joinRoom: function (context, event) { return _this.joinRoom(context, event); },
                addSocketToDB: function (context, event) { return _this.addSocketToDB(context, event); },
                rejectSocketConnection: function (_ctx, event) { return PondSocket.rejectSocketConnection(event); },
                shutDownServer: function (context, event) { return _this.shutDownServer(context, event); },
            }, services: {
                authenticateRoom: function (context, event) { return _this.authenticateRoom(context, event); },
                authenticateSocket: function (context, event) { return _this.authenticateSocket(context, event); },
                setupServer: function (context) { return _this.setupServer(context); },
            }
        });
        this._interpreter = (0, xstate_1.interpret)(stateMachine).start();
    };
    /**
     * @desc generate an accept function for the socket connection
     * @param obj - the object that is being accepted
     * @param resolve - the resolve function of the promise
     * @param endpoint - the endpoint of the socket connection
     * @private
     */
    PondSocket.prototype.generateAccept = function (obj, resolve, endpoint) {
        var _this = this;
        return function (assigns) {
            _this._wss.handleUpgrade(obj.request, obj.socket, obj.head, function (ws) {
                assigns = assigns || {};
                var clientId = _this._base.createUUID();
                _this._wss.emit('connection', ws, __assign(__assign({}, assigns), { clientId: clientId }));
                ws.on('message', function (message) {
                    var _a, _b;
                    try {
                        var data = JSON.parse(message.toString());
                        if (data.topic === 'NEW_INCOMING_REQUEST' && data.channel && data.payload)
                            (_a = _this._interpreter) === null || _a === void 0 ? void 0 : _a.send({
                                type: 'requestToJoinRoom',
                                clientId: clientId,
                                socket: ws, roomToJoin: data.channel,
                                endpoint: endpoint,
                                assigns: __assign(__assign({}, assigns), { id: clientId }), roomData: ((_b = data.payload) === null || _b === void 0 ? void 0 : _b.roomData) || {},
                            });
                    }
                    catch (e) {
                        var message_1 = {
                            topic: "ERROR_RESPONSE",
                            channel: '*',
                            payload: {
                                error: "INVALID_JSON",
                                errorCode: 504
                            }
                        };
                        ws.send(JSON.stringify(message_1));
                    }
                });
                resolve({
                    clientId: clientId,
                    socket: ws,
                    assigns: assigns,
                });
            });
        };
    };
    /**
     * @desc authenticate a socket connection
     * @param _context - the context of the state machine
     * @param event - the event that is being handled
     * @private
     */
    PondSocket.prototype.authenticateSocket = function (_context, event) {
        var _this = this;
        return (0, base_1.BasePromise)(function (resolve, reject) {
            var pathname = (0, url_1.parse)(event.request.url || '').pathname;
            if (!pathname)
                return reject('No pathname provided', 400, event.socket);
            var auth = _this._paths.find(function (p) { return PondSocket.compareStringToPattern(pathname, p.pattern); });
            if (!auth)
                return reject('No authentication found for this endpoint', 404, event.socket);
            auth.handler({
                request: event.request,
                accept: _this.generateAccept(event, resolve, pathname),
                decline: function (message) { return reject(message, 401, event.socket); }
            });
        });
    };
    /**
     * @desc adds a newly authenticated socket to the pond
     * @param context - the context of the state machine
     * @param event - the event that is being handled
     * @private
     */
    PondSocket.prototype.addSocketToDB = function (context, event) {
        var assigns = __assign(__assign({}, event.data.assigns), { clientId: event.data.clientId });
        (0, xstate_1.assign)({
            sockets: new Map(context.sockets.set(event.data.socket, assigns))
        });
    };
    /**
     * @desc authorises a socket connection to the room provided
     * @param _context - the context of the state machine
     * @param event - the event that is being handled
     * @private
     */
    PondSocket.prototype.authenticateRoom = function (_context, event) {
        var _this = this;
        return (0, base_1.BasePromise)(function (resolve, reject) {
            var _a;
            var roomToJoin = event.roomToJoin, endpoint = event.endpoint;
            var auth = (_a = _this._paths.find(function (p) { return PondSocket.compareStringToPattern(endpoint, p.pattern); })) === null || _a === void 0 ? void 0 : _a.rooms.find(function (r) { return PondSocket.compareStringToPattern(roomToJoin, r.pattern); });
            if (!auth)
                return reject('No authentication found for this endpoint', 404, {
                    room: roomToJoin,
                    socket: event.socket,
                });
            auth.handler({
                request: event,
                accept: function (data) {
                    var newAssigns = __assign(__assign({}, event.assigns), data === null || data === void 0 ? void 0 : data.assigns);
                    var newPresence = __assign({}, data === null || data === void 0 ? void 0 : data.presence);
                    var newRoomData = __assign({}, data === null || data === void 0 ? void 0 : data.roomData);
                    resolve({
                        endpoint: endpoint,
                        clientId: event.clientId,
                        assigns: newAssigns,
                        presence: newPresence,
                        roomData: newRoomData,
                        socket: event.socket,
                        roomName: roomToJoin,
                        verifiers: auth.events,
                    });
                },
                decline: function (message) { return reject(message, 401, {
                    room: roomToJoin,
                    socket: event.socket,
                }); }
            });
        });
    };
    /**
     * @desc adds a newly authenticated socket to the room provided
     * @param context - the context of the state machine
     * @param event - the event that is being handled
     * @private
     */
    PondSocket.prototype.joinRoom = function (context, event) {
        var accessor = this._base.encrypt(event.data.endpoint, { room: event.data.roomName });
        var channel = context.channels.get(accessor);
        if (!channel || channel.state === 'inactive')
            channel = new channels_1.Channel(event.data.roomName, event.data.roomData, event.data.verifiers);
        channel.addSocket(event.data);
        (0, xstate_1.assign)({
            channels: new Map(context.channels.set(accessor, channel))
        });
    };
    /**
     * @desc shuts down the pond and closes all sockets
     * @param _context - the context of the state machine
     * @param _event - the event that is being handled
     * @private
     */
    PondSocket.prototype.shutDownServer = function (_context, _event) {
        var _a;
        this._wss.clients.forEach(function (client) { return client.terminate(); });
        this._wss.close();
        this._server.close();
        (_a = this._interpreter) === null || _a === void 0 ? void 0 : _a.stop();
        process.exit(0);
    };
    /**
     * @desc starts the pond server
     * @param _context - the context of the state machine
     * @private
     */
    PondSocket.prototype.setupServer = function (_context) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._server.on('upgrade', function (request, socket, head) {
                var _a;
                (_a = _this._interpreter) === null || _a === void 0 ? void 0 : _a.send({
                    type: 'newUpgradeRequest',
                    request: request,
                    head: head,
                    socket: socket,
                });
            });
            _this._server.on('error', function (error) {
                return reject(error);
            });
            _this._server.on('listening', function () {
                _this.pingClients(_this._wss);
                return resolve();
            });
        });
    };
    /**
     * @desc Makes sure that every client is still connected to the pond
     * @param server - WebSocket server
     */
    PondSocket.prototype.pingClients = function (server) {
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
    return PondSocket;
}());
exports.PondSocket = PondSocket;
