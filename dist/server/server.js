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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondSocket = exports.Channel = void 0;
var ws_1 = require("ws");
var utils_1 = require("./utils");
var http_1 = require("http");
var url_1 = require("url");
var channel_1 = require("./channel");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var Channel = /** @class */ (function () {
    function Channel(channelName, subject, verifiers) {
        this.channelName = channelName;
        this.base = new utils_1.BaseClass();
        this.subject = subject;
        this.channelId = this.base.uuid();
        this.verifiers = verifiers;
        this.data = {};
        this.presence = new utils_1.BaseMap();
        this.assigns = new utils_1.BaseMap();
        this.listenToClientDisconnected();
    }
    Object.defineProperty(Channel.prototype, "newUser", {
        /**
         * @desc Adds a new user to the channel
         * @param user - The user to add to the channel
         */
        set: function (user) {
            this.presence.set(user.clientId, user.presence);
            this.assigns.set(user.clientId, user.assigns);
            this.data = __assign(__assign({}, this.data), user.channelData);
            var message = {
                action: 'PRESENCE_BRIEF',
                event: 'join', clientId: user.clientId,
                channelName: this.channelName,
                addresses: this.clientIds,
                payload: {
                    presence: this.presenceList,
                    joined: user.presence
                }
            };
            this.sendToClients(message);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "presenceList", {
        /**
         * @desc Gets the list of presence in the channel
         */
        get: function () {
            return this.presence.toArray();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "channelData", {
        /**
         * @desc Gets the data of the channel
         */
        get: function () {
            return this.data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "clientIds", {
        /**
         * @desc Gets the list of users in the channel
         * @private
         */
        get: function () {
            return Array.from(this.presence.keys());
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "info", {
        /**
         * @desc Gets the information of the channel
         */
        get: function () {
            return {
                channelId: this.channelId,
                channelName: this.channelName,
                presence: this.presenceList,
                channelData: this.channelData
            };
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @desc Sends a message to the clients addressed in the channel
     * @param message - The message to send
     */
    Channel.prototype.sendToClients = function (message) {
        this.subject.next(message);
    };
    /**
     * @desc Removes a user from the channel
     * @param clientId - The clientId of the user to remove
     */
    Channel.prototype.removeUser = function (clientId) {
        var client = this.getUser(clientId);
        if (!client) {
            var error = new utils_1.PondError("Client " + clientId + " does not exist in channel " + this.channelName, 301, clientId);
            return this.sendError(error);
        }
        this.presence.deleteKey(clientId);
        this.assigns.deleteKey(clientId);
        if (this.clientIds.length === 0) {
            var message = {
                action: 'CHANNEL_DESTROY',
                channelName: this.channelName,
                addresses: [], payload: {},
                clientId: this.channelId, event: 'destroy'
            };
            this.subject.next(message);
        }
        else {
            var message = {
                action: 'PRESENCE_BRIEF',
                event: 'leave', clientId: clientId,
                channelName: this.channelName,
                addresses: this.clientIds,
                payload: {
                    presence: this.presenceList,
                    left: client.clientPresence
                },
            };
            this.sendToClients(message);
        }
    };
    /**
     * @desc Checks if a user is in the channel
     * @param clientId - The clientId of the user to check
     */
    Channel.prototype.hasUser = function (clientId) {
        return this.presence.has(clientId) || this.assigns.has(clientId);
    };
    /**
     * @desc Updates the state of a user in the channel
     * @param clientId - The clientId of the user to update
     * @param presence - The new presence of the user
     * @param assigns - The new assigns of the user
     */
    Channel.prototype.updateUser = function (clientId, presence, assigns) {
        var client = this.getUser(clientId);
        if (!client) {
            var error = new utils_1.PondError("Client " + clientId + " does not exist in channel " + this.channelName, 301, clientId);
            return this.sendError(error);
        }
        var internalAssign = __assign(__assign({}, client.clientAssigns), assigns);
        var internalPresence = __assign(__assign({}, client.clientPresence), presence);
        this.presence.set(clientId, internalPresence);
        this.assigns.set(clientId, internalAssign);
        var message = {
            action: 'PRESENCE_BRIEF',
            event: 'update', clientId: clientId,
            channelName: this.channelName,
            addresses: this.clientIds,
            payload: {
                presence: this.presenceList,
                updated: internalPresence
            }
        };
        this.sendToClients(message);
    };
    /**
     * @desc Authorises the message before sending it through the channel
     * @param event - The event to authorise
     * @param message - The message to authorise\
     * @param clientId - The clientId of the user sending the message
     * @param type - The type of message to authorise
     * @param addresses - The addresses of the message
     */
    Channel.prototype.authorise = function (event, message, clientId, type, addresses) {
        var _this = this;
        return (0, utils_1.BasePromise)(function (resolve, reject) {
            var _a;
            var client = _this.getUser(clientId);
            if (!client)
                return reject("Client not found", 404, clientId);
            var request = {
                event: event,
                channelId: _this.channelId,
                channelName: _this.channelName,
                message: message,
                client: client,
            };
            var newAddresses = [];
            switch (type) {
                case 'BROADCAST_FROM':
                    newAddresses = _this.clientIds.filter(function (e) { return e !== clientId; });
                    break;
                case 'BROADCAST':
                    newAddresses = _this.clientIds;
                    break;
                case 'SEND_MESSAGE_TO_USER':
                    newAddresses = addresses ? addresses : [];
                    break;
            }
            var newMessage = {
                action: 'MESSAGE', payload: message,
                event: event, clientId: clientId,
                channelName: _this.channelName,
                addresses: newAddresses
            };
            var response = _this.base.generatePondResponse(function (assigns) {
                if (assigns) {
                    if (assigns.channelData)
                        _this.data = __assign(__assign({}, _this.data), assigns.channelData);
                    if (!_this.base.isObjectEmpty(assigns.presence) || !_this.base.isObjectEmpty(assigns.assign))
                        _this.updateUser(clientId, assigns.presence, assigns.assign);
                }
                _this.sendToClients(newMessage);
                resolve();
            }, reject, clientId);
            var newChannel = new channel_1.InternalPondChannel(_this);
            var verifier = (_a = _this.verifiers.findByKey(function (e) { return _this.base.compareStringToPattern(event, e); })) === null || _a === void 0 ? void 0 : _a.value;
            if (!verifier) {
                _this.sendToClients(newMessage);
                return resolve();
            }
            verifier(request, response, newChannel);
        }, clientId);
    };
    /**
     * @desc Sends an error to the client
     * @param error - The error to send
     */
    Channel.prototype.sendError = function (error) {
        var message = {
            action: 'CHANNEL_ERROR',
            event: 'error', clientId: this.channelId,
            channelName: this.channelName,
            addresses: [error.data],
            payload: {
                error: error.errorMessage,
                code: error.errorCode,
            },
        };
        this.sendToClients(message);
    };
    /**
     * @desc Gets a user's data from the channel
     * @param clientId - The clientId of the user to get data for
     * @private
     */
    Channel.prototype.getUser = function (clientId) {
        if (!this.presence.has(clientId) || !this.assigns.has(clientId))
            return null;
        return {
            clientId: clientId,
            clientAssigns: this.assigns.get(clientId),
            clientPresence: this.presence.get(clientId),
        };
    };
    /**
     * @desc Listens to the client disconnected Message
     */
    Channel.prototype.listenToClientDisconnected = function () {
        var _this = this;
        this.subject
            .subscribe(function (message) {
            if (message.action === 'CLIENT_DISCONNECTED')
                _this.removeUser(message.clientId);
        });
    };
    return Channel;
}());
exports.Channel = Channel;
var PondSocket = /** @class */ (function () {
    function PondSocket(server, socketServer) {
        this.endpoints = new utils_1.BaseMap();
        this.base = new utils_1.BaseClass();
        this.server = server || new http_1.Server();
        this.socketServer = socketServer || new ws_1.WebSocketServer({ noServer: true });
        this.init();
    }
    /**
     * @desc Rejects the client's connection
     * @param error - Reason for rejection
     */
    PondSocket.rejectClient = function (error) {
        var errorMessage = error.errorMessage, errorCode = error.errorCode, socket = error.data;
        socket.write("HTTP/1.1 " + errorCode + " " + errorMessage + "\r\n\r\n");
        socket.destroy();
    };
    /**
     * @desc Sends a message to a client
     * @param socket - The socket to send the message to
     * @param message - The message to send
     */
    PondSocket.sendMessage = function (socket, message) {
        socket.send(JSON.stringify(message));
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
    PondSocket.prototype.createEndpoint = function (path, handler) {
        var endpointId = this.base.uuid();
        var endpoint = {
            path: path,
            handler: handler,
            authorizers: new utils_1.BaseMap(),
            socketCache: new utils_1.BaseMap(),
            channels: new utils_1.BaseMap(),
            subject: new rxjs_1.Subject(),
        };
        this.endpoints.set(endpointId, endpoint);
        return new channel_1.PondEndpoint(endpoint);
    };
    /**
     * @desc Specifies the port to listen on
     * @param port - the port to listen on
     * @param callback - the callback to call when the server is listening
     */
    PondSocket.prototype.listen = function (port, callback) {
        return this.server.listen(port, callback);
    };
    /**
     * @desc Gets a channel and performs an action on it
     * @param endpointId - The id of the endpoint the channel is on
     * @param channelName - The id of the channel to perform the action on
     * @param action - The action to perform on the channel
     * @private
     */
    PondSocket.prototype.channelAction = function (endpointId, channelName, action) {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, channel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = this.endpoints.get(endpointId);
                        if (!endpoint)
                            throw new utils_1.PondError('No endpoint found', 404, { channelName: channelName });
                        channel = endpoint.channels.find(function (channel) { return channel.channelName === channelName; });
                        if (!channel)
                            throw new utils_1.PondError('No channel found', 404, { channelName: channelName });
                        return [4 /*yield*/, action(channel.value)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
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
    /**
     * @desc Initializes the server
     */
    PondSocket.prototype.init = function () {
        var _this = this;
        this.server.on('upgrade', function (request, socket, head) {
            _this.authenticateClient(request, socket, head)
                .then(function (socket) { return _this.addSocketListeners(socket); })
                .catch(function (error) { return PondSocket.rejectClient(error); });
        });
        this.server.on('error', function (error) {
            throw new utils_1.PondError('Server error', 500, { error: error });
        });
        this.server.on('listening', function () {
            _this.pingClients(_this.socketServer);
        });
    };
    /**
     * @desc Leaves a channel
     * @param endpointId - The endpointId of the endpoint to leave
     * @param clientId - The clientId of the client to leave
     * @param channelName - The name of the channel to leave
     */
    PondSocket.prototype.leaveChannel = function (endpointId, clientId, channelName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.channelAction(endpointId, channelName, function (channel) { return channel.removeUser(clientId); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @desc Authenticates the client by checking if there is a matching endpoint
     * @param request - Incoming request
     * @param socket - Incoming socket
     * @param head - Incoming head
     */
    PondSocket.prototype.authenticateClient = function (request, socket, head) {
        var _this = this;
        return (0, utils_1.BasePromise)(function (resolve, reject) {
            var pathname = (0, url_1.parse)(request.url || '').pathname;
            if (!pathname)
                return reject('No pathname found', 404, socket);
            var endpoint = _this.endpoints.find(function (endpoint) { return _this.base.compareStringToPattern(pathname, endpoint.path); });
            if (!endpoint)
                return reject('No endpoint found', 404, socket);
            var response = _this.base.generatePondResponse(function (assigns) {
                var clientId = _this.base.uuid();
                var intAssigns = assigns.assign || {};
                _this.socketServer.handleUpgrade(request, socket, head, function (ws) {
                    var socketCache = {
                        clientId: clientId,
                        assigns: intAssigns,
                        socket: ws, endpointId: endpoint.key,
                    };
                    _this.socketServer.emit('connection', ws);
                    endpoint.value.socketCache.set(clientId, socketCache);
                    resolve(socketCache);
                });
            }, reject, socket);
            endpoint.value.handler(request, response);
        }, socket);
    };
    /**
     * @desc Receives as socketCache and adds listeners to it
     * @param cache - Socket cache to add listeners to
     */
    PondSocket.prototype.addSocketListeners = function (cache) {
        var _this = this;
        var endpoint = this.endpoints.get(cache.endpointId);
        if (!endpoint)
            throw new utils_1.PondError('No endpoint found', 404, { clientId: cache.clientId });
        var subscription = endpoint.subject.pipe((0, operators_1.filter)(function (message) { return message.addresses.includes(cache.clientId); })).subscribe(function (message) { return PondSocket.handleServerMessage(cache.socket, message); });
        cache.socket.addEventListener('message', function (message) { return _this.readMessage(cache, message.data); });
        cache.socket.addEventListener('close', function () {
            var message = {
                action: 'CLIENT_DISCONNECTED',
                clientId: cache.clientId,
                addresses: [], event: 'close',
                channelName: 'END_POINT', payload: {},
            };
            endpoint.subject.next(message);
            endpoint.socketCache.deleteKey(cache.clientId);
            subscription.unsubscribe();
        });
        cache.socket.addEventListener('error', function () {
            var message = {
                action: 'CLIENT_DISCONNECTED',
                clientId: cache.clientId,
                addresses: [], event: 'close',
                channelName: 'END_POINT', payload: {},
            };
            endpoint.subject.next(message);
            endpoint.socketCache.deleteKey(cache.clientId);
            subscription.unsubscribe();
        });
    };
    /**
     * @desc Authorises the client to join a channel
     * @param clientId - The id of the client making the request
     * @param channelName - The name of the channel the client wishes to join
     * @param endpointId - The id of the endpoint the client is connected to
     */
    PondSocket.prototype.authoriseClient = function (clientId, channelName, endpointId) {
        var _this = this;
        return (0, utils_1.BasePromise)(function (resolve, reject) {
            var _a;
            var endpoint = _this.endpoints.get(endpointId);
            if (!endpoint)
                return reject('No endpoint found', 404, { channelName: channelName, clientId: clientId });
            var authorizer = (_a = endpoint.authorizers.findByKey(function (authorizer) { return _this.base.compareStringToPattern(channelName, authorizer); })) === null || _a === void 0 ? void 0 : _a.value;
            if (!authorizer)
                return reject('No authorizer found', 404, { channelName: channelName, clientId: clientId });
            var socketCache = endpoint.socketCache.get(clientId);
            var channelId;
            var channel;
            var presentChannel = endpoint.channels.find(function (channel) { return channel.channelName === channelName; });
            if (presentChannel) {
                channelId = presentChannel.key;
                channel = presentChannel.value;
            }
            else {
                channel = new Channel(channelName, endpoint.subject, authorizer.events);
                channelId = channel.channelId;
                endpoint.channels.set(channelId, channel);
            }
            if (channel.hasUser(clientId))
                return reject('Client already in channel', 403, { channelName: channelName, clientId: clientId });
            var request = {
                clientId: clientId,
                channelName: channelName,
                channelId: channelId,
                clientAssigns: socketCache.assigns,
            };
            var response = _this.base.generatePondResponse(function (assigns) {
                var intAssigns = __assign(__assign({}, socketCache.assigns), assigns.assign);
                var intPresence = __assign({}, assigns.presence);
                channel.newUser = {
                    presence: intPresence,
                    clientId: clientId,
                    assigns: intAssigns,
                    channelData: assigns.channelData || {}
                };
                return resolve();
            }, reject, { channelName: channelName, clientId: clientId });
            authorizer.handler(request, response);
        }, { channelName: channelName, clientId: clientId });
    };
    /**
     * @desc Handles a message sent from a client
     * @param cache - The socket cache of the client
     * @param message - The message to handle
     * @private
     */
    PondSocket.prototype.readMessage = function (cache, message) {
        return __awaiter(this, void 0, void 0, function () {
            var errorMessage, data, e_1, message_1, message_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        errorMessage = {
                            action: 'ERROR',
                            event: 'INVALID_MESSAGE',
                            channelName: 'END_POINT',
                            payload: {}
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        data = JSON.parse(message);
                        if (!!data.action) return [3 /*break*/, 2];
                        errorMessage.payload = {
                            message: 'No action provided',
                        };
                        return [3 /*break*/, 6];
                    case 2:
                        if (!!data.channelName) return [3 /*break*/, 3];
                        errorMessage.payload = {
                            message: 'No channelName provided',
                        };
                        return [3 /*break*/, 6];
                    case 3:
                        if (!!data.payload) return [3 /*break*/, 4];
                        errorMessage.payload = {
                            message: 'No payload provided',
                        };
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.handleMessage(cache, data)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!this.base.isObjectEmpty(errorMessage.payload))
                            PondSocket.sendMessage(cache.socket, errorMessage);
                        return [3 /*break*/, 8];
                    case 7:
                        e_1 = _a.sent();
                        if (e_1 instanceof SyntaxError) {
                            message_1 = {
                                action: 'ERROR',
                                event: 'INVALID_MESSAGE',
                                channelName: 'END_POINT',
                                payload: {
                                    message: e_1.message
                                }
                            };
                            PondSocket.sendMessage(cache.socket, message_1);
                        }
                        else if (e_1 instanceof utils_1.PondError) {
                            message_2 = {
                                action: 'ERROR',
                                event: 'INVALID_MESSAGE',
                                channelName: 'END_POINT',
                                payload: {
                                    message: e_1.errorMessage,
                                    code: e_1.errorCode,
                                    data: e_1.data
                                }
                            };
                            PondSocket.sendMessage(cache.socket, message_2);
                        }
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @desc Deals with a message sent from a client
     * @param cache - The socket cache of the client
     * @param message - The message to handle
     */
    PondSocket.prototype.handleMessage = function (cache, message) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = message.action;
                        switch (_a) {
                            case 'JOIN_CHANNEL': return [3 /*break*/, 1];
                            case 'LEAVE_CHANNEL': return [3 /*break*/, 3];
                            case 'BROADCAST_FROM': return [3 /*break*/, 5];
                            case 'BROADCAST': return [3 /*break*/, 7];
                            case 'SEND_MESSAGE_TO_USER': return [3 /*break*/, 9];
                            case 'UPDATE_PRESENCE': return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 1: return [4 /*yield*/, this.authoriseClient(cache.clientId, message.channelName, cache.endpointId)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 3: return [4 /*yield*/, this.leaveChannel(cache.endpointId, cache.clientId, message.channelName)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 5: return [4 /*yield*/, this.channelAction(cache.endpointId, message.channelName, function (channel) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, channel.authorise(message.event, message.payload, cache.clientId, 'BROADCAST_FROM')];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 7: return [4 /*yield*/, this.channelAction(cache.endpointId, message.channelName, function (channel) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, channel.authorise(message.event, message.payload, cache.clientId, 'BROADCAST')];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 9: return [4 /*yield*/, this.channelAction(cache.endpointId, message.channelName, function (channel) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, channel.authorise(message.event, message.payload, cache.clientId, 'SEND_MESSAGE_TO_USER', message.addresses)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 11: return [4 /*yield*/, this.channelAction(cache.endpointId, message.channelName, function (channel) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0: return [4 /*yield*/, channel.updateUser(cache.clientId, (_a = message.payload) === null || _a === void 0 ? void 0 : _a.presence, (_b = message.payload) === null || _b === void 0 ? void 0 : _b.assigns)];
                                    case 1:
                                        _c.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 12:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @desc Handles a message sent by the server and sends it to the client
     * @param socket - The socket to send the message to
     * @param message - The message to send
     * @private
     */
    PondSocket.handleServerMessage = function (socket, message) {
        var newMessage;
        switch (message.action) {
            case 'PRESENCE_BRIEF':
                newMessage = {
                    action: 'PRESENCE',
                    event: 'PRESENCE_BRIEF',
                    channelName: message.channelName,
                    payload: message.payload
                };
                break;
            case 'MESSAGE':
                newMessage = {
                    action: 'MESSAGE',
                    event: message.event,
                    channelName: message.channelName,
                    payload: message.payload
                };
                break;
            case 'KICKED_FROM_CHANNEL':
                newMessage = {
                    action: 'ACTION',
                    event: 'KICKED_FROM_CHANNEL',
                    channelName: message.channelName,
                    payload: message.payload
                };
                break;
            case 'CLIENT_DISCONNECTED':
            case 'CLOSED_FROM_SERVER':
                newMessage = {
                    action: 'ACTION',
                    event: 'CLOSED_FROM_SERVER',
                    channelName: message.channelName,
                    payload: message.payload
                };
                break;
            case 'CHANNEL_DESTROY':
                newMessage = {
                    action: 'ACTION',
                    event: 'CHANNEL_DESTROYED',
                    channelName: message.channelName,
                    payload: message.payload
                };
                break;
            case 'CHANNEL_ERROR':
                newMessage = {
                    action: 'ERROR',
                    event: 'CHANNEL_ERROR',
                    channelName: message.channelName,
                    payload: message.payload
                };
                break;
        }
        PondSocket.sendMessage(socket, newMessage);
        if (message.action === 'CLOSED_FROM_SERVER')
            setTimeout(socket.close, 500);
    };
    return PondSocket;
}());
exports.PondSocket = PondSocket;
