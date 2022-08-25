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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndpointMachine = void 0;
var xstate_1 = require("xstate");
var utils_1 = require("./utils");
var operators_1 = require("rxjs/operators");
var channel_state_1 = require("./channel.state");
var EndpointMachine = /** @class */ (function () {
    function EndpointMachine(ctx, endpointId) {
        var _this = this;
        /**
         * @desc Adds a socket to the database
         * @param ctx - The context of the endpoint machine
         * @param evt - The event that triggered the action
         */
        this.addSocketToDB = function (ctx, evt) {
            var _a = evt.data, clientId = _a.clientId, socket = _a.socket, assigns = _a.assigns;
            var subscription = ctx.observable
                .pipe((0, operators_1.filter)(function (x) { return x.type === 'SERVER'; }), (0, operators_1.filter)(function (x) {
                return x.addresses.includes(clientId);
            })).subscribe(function (x) { return _this.handleServerEvent(x, socket, clientId); });
            socket.addEventListener('close', function () {
                var message = {
                    type: 'CLIENT',
                    event: 'CLIENT_DISCONNECTED',
                    clientId: clientId,
                };
                ctx.observable.next(message);
                subscription.unsubscribe();
            });
            socket.addEventListener('error', function () {
                var message = {
                    type: 'CLIENT',
                    event: 'CLIENT_DISCONNECTED',
                    clientId: clientId,
                };
                ctx.observable.next(message);
                subscription.unsubscribe();
            });
            socket.addEventListener('message', function (message) { return _this.handleClientMessage(message.data, assigns); });
        };
        this.base = new utils_1.BaseClass();
        this.interpreter = this.start(ctx, endpointId);
    }
    /**
     * @desc Rejects a socket connection
     * @param _ctx - The context of the endpoint machine
     * @param evt - The event that triggered the action
     */
    EndpointMachine.rejectSocketConnection = function (_ctx, evt) {
        evt.data.data.write("HTTP/1.1 " + evt.data.errorCode + " " + evt.data.errorMessage + "\r\n\r\n");
        evt.data.data.destroy();
    };
    /**
     * @desc Start the endpoint machine.
     * @param ctx - The context to start the machine with.
     * @param endpointId - The id of the endpoint.
     * @private
     */
    EndpointMachine.prototype.start = function (ctx, endpointId) {
        var _this = this;
        var machine = /** @xstate-layout N4IgpgJg5mDOIC5RgHYQA4HsCWKAuAdAE5gCGEAngMSkCueAFqntgMal5gDKmrA1mDyJQWWNhaYUwkAA9EAWgCMigKwA2AmsUAWAByKAzKoCcagAwGA7ABoQFBdsWWC2s8cUAmT5a+W-AX39bVAwcfGIySioAKzCAYQZSFBQwABsAJTAAR1o4ISQQUXFsSWk5BCVVRRcDVw8zS0VjXRa1W3sKtV1jFw8PbsU1SzM1DwMPQOC0LFxCdDAiADNMIgBbAEF6BioISTACXAA3TAECEJnw+aWVja2EI94OEpQAbTMAXWkiiSkC8qVtNoDARBioLGDtGpmj52g4DBpjGYPK5IboDGYVAZdJNwNMwnMFss1ptGFQFkQVgR0KkOETVmc8bMqYSbiSGPcUMd2D83p8Ct9nmUFMYsQRdNo+mZWminB5YRUgQikVjFejdGptDjzviCHRGCtsLBuLwBHgdnsDpyTvttUy9QwDUaePxBByuU9JLyvpgxD8hRUdLpnMjTCoRQYVP0DPL5I0emj+ipXCpLCowdigrjQnato7jS6zeTKdTaTcGdnwva887TW7HjyPt7fYK-sLkQR4V1If0PGCMTHU841CpDA0xn0fIFMyhMBA4NJbeESOQOiIfcVSq2A4ozNVRp4DMZHMMDOMY0ngSog+jTEDusZjFrGZcWcStk2N79QP9lC0CCK+x0Uxmg8Gw7AUXtnDTSw1HRTxjEsZonwrQgqyIQ181ND8-S3JRkWBDxmiMVM0W0ME5XAipumBEVtGMMM+hHVxLGQi58jXZtN2-BQqmqENh3DSM0RjUN-z6HQfEccV4SnfwgA */ (0, xstate_1.createMachine)({
            context: ctx,
            tsTypes: {},
            schema: { events: {}, context: {} },
            predictableActionArguments: true,
            states: {
                ready: {
                    on: {
                        authenticateSocket: {
                            target: "performAuth",
                        }, joinChannelRequest: {
                            target: "authoriseSocket",
                        },
                    },
                }, performAuth: {
                    invoke: {
                        src: "performAuthentication", onDone: [{
                                actions: "addSocketToDB", target: "ready",
                            },], onError: [{
                                actions: "rejectSocketConnection", target: "ready",
                            },],
                    },
                }, authoriseSocket: {
                    invoke: {
                        src: "authoriseSocketToJoinChannel", onDone: [{
                                actions: "addSocketToChannel", target: "ready",
                            },], onError: [{
                                actions: "rejectChannelRequest", target: "ready",
                            },],
                    },
                },
            },
            id: endpointId,
            initial: "ready",
        }, {
            actions: {
                addSocketToDB: function (ctx, evt) { return _this.addSocketToDB(ctx, evt); },
                addSocketToChannel: function (ctx, evt) { return _this.addSocketToChannel(ctx, evt); },
                rejectSocketConnection: function (ctx, evt) { return EndpointMachine.rejectSocketConnection(ctx, evt); },
                rejectChannelRequest: function (ctx, evt) { return _this.rejectChannelRequest(ctx, evt); },
            }, services: {
                performAuthentication: function (ctx, evt) { return _this.performAuthentication(ctx, evt); },
                authoriseSocketToJoinChannel: function (ctx, evt) { return _this.authoriseSocketToJoinChannel(ctx, evt); },
            }
        });
        return (0, xstate_1.interpret)(machine).start();
    };
    /**
     * @desc Adds a socket to a channel
     * @param ctx - The context of the endpoint machine
     * @param evt - The event that triggered the action
     */
    EndpointMachine.prototype.addSocketToChannel = function (ctx, evt) {
        var channel = ctx.channels.get(evt.data.channelData.channelId);
        if (!channel)
            return this.sendError(evt.data.clientId, 'No such channel exists', true, evt.data.channelData.channelId, evt.data.channelName);
        var client = channel.state.context.presences.get(evt.data.clientId);
        if (!client)
            channel.send({
                type: 'joinRoom',
                clientId: evt.data.clientId,
                data: evt.data
            });
        else
            return this.sendError(evt.data.clientId, 'You have already joined this channel', true, evt.data.channelData.channelId, evt.data.channelName);
    };
    /**
     * @desc Rejects a socket's request to join a channel
     * @param _ctx - The context of the endpoint machine
     * @param evt - The event that triggered the action
     */
    EndpointMachine.prototype.rejectChannelRequest = function (_ctx, evt) {
        this.sendError(evt.data.data.clientId, evt.data.errorMessage, true, evt.data.data.channelName, 'END_POINT');
    };
    /**
     * @desc Performs authentication of a socket
     * @param ctx - The context of the endpoint machine
     * @param evt - The event that triggered the action
     */
    EndpointMachine.prototype.performAuthentication = function (ctx, evt) {
        var _this = this;
        return (0, utils_1.BasePromise)(function (resolve, reject) {
            var response = _this.base.generatePondResponse(function (assigns) { return __awaiter(_this, void 0, void 0, function () {
                var clientId, internalAssigns, server;
                return __generator(this, function (_a) {
                    clientId = this.base.uuid();
                    internalAssigns = __assign(__assign({}, assigns.assign), { clientId: clientId });
                    server = this.interpreter.state.context.socketServer;
                    server.handleUpgrade(evt.data.request, evt.data.socket, evt.data.head, function (socket) {
                        resolve({
                            clientId: clientId,
                            socket: socket,
                            assigns: internalAssigns,
                        });
                        server.emit('connection', socket);
                    });
                    return [2 /*return*/];
                });
            }); }, reject, evt.data.socket);
            ctx.handler(evt.data.request, response);
        }, evt.data.socket);
    };
    /**
     * @desc Authorises a socket to join a channel
     * @param ctx - The context of the endpoint machine
     * @param evt - The event that triggered the action
     */
    EndpointMachine.prototype.authoriseSocketToJoinChannel = function (ctx, evt) {
        var _this = this;
        return (0, utils_1.BasePromise)(function (resolve, reject) {
            var _a, _b;
            var _c = evt.data.assigns, clientId = _c.clientId, clientAssigns = __rest(_c, ["clientId"]);
            var channel;
            var authorizer = ctx.authorizers.findByKey(function (path) { return _this.base.compareStringToPattern(evt.data.channelName, path); });
            if (!authorizer)
                return reject('No authorizer found', 404, {
                    channelName: evt.data.channelName,
                    assigns: evt.data.assigns,
                    clientId: clientId,
                });
            channel = (_a = ctx.channels.find(function (channel) { return channel.state.context.channelName === evt.data.channelName; })) === null || _a === void 0 ? void 0 : _a.value;
            var channelId = (_b = channel === null || channel === void 0 ? void 0 : channel.state.context.channelId) !== null && _b !== void 0 ? _b : _this.base.uuid();
            if (!channel || channel.status === xstate_1.InterpreterStatus.Stopped)
                channel = new channel_state_1.ChannelMachine({
                    channelId: channelId,
                    channelName: evt.data.channelName,
                    channelData: new utils_1.BaseMap(),
                    verifiers: authorizer.value.events,
                    observable: ctx.observable,
                    presences: new utils_1.BaseMap(),
                    assigns: new utils_1.BaseMap(),
                }, _this.interpreter).interpreter;
            var request = {
                clientId: evt.data.clientId,
                channelId: channel.state.context.channelId,
                channelName: evt.data.channelName,
                clientAssigns: clientAssigns
            };
            var response = _this.base.generatePondResponse(function (assigns) {
                var internalAssigns = __assign(__assign(__assign({}, clientAssigns), assigns.assign), { clientId: clientId });
                var channelData = __assign(__assign({}, channel.state.context.channelData), assigns.channelData);
                var internalPresence = __assign(__assign({}, assigns.presence), { clientId: clientId });
                resolve({
                    clientId: clientId,
                    assigns: internalAssigns,
                    presence: internalPresence,
                    channelName: evt.data.channelName,
                    channelData: __assign(__assign({}, channelData), { channelId: channel.state.context.channelId }),
                });
            }, reject, {
                channelName: evt.data.channelName,
                assigns: evt.data.assigns,
                clientId: clientId,
            });
            (0, xstate_1.assign)({
                channels: new utils_1.BaseMap(ctx.channels.set(channel.state.context.channelId, channel)),
            });
            authorizer.value.handler(request, response);
        }, {
            channelName: evt.data.channelName,
            assigns: evt.data.assigns,
            clientId: evt.data.assigns.clientId,
        });
    };
    /**
     * @desc Handles server events and sends them to the client
     * @param evt - The event emitted by the server's observable
     * @param socket - The socket to send the event to
     * @param clientId - The client id of the socket
     */
    EndpointMachine.prototype.handleServerEvent = function (evt, socket, clientId) {
        var _a;
        var message;
        switch (evt.event) {
            case "BROADCAST_MESSAGE":
                message = {
                    action: 'MESSAGE',
                    channelId: 'END_POINT',
                    channelName: 'END_POINT',
                    payload: evt.payload,
                };
                break;
            case "PRESENCE_UPDATE":
                message = {
                    action: 'PRESENCE_UPDATE',
                    channelId: evt.channelId,
                    channelName: evt.channelName,
                    payload: evt.payload,
                };
                break;
            case "CHANNEL_ERROR":
                message = {
                    action: 'CHANNEL_ERROR',
                    channelId: evt.channelId,
                    channelName: evt.channelName,
                    payload: {
                        error: evt.reason
                    },
                };
                break;
            case "BROADCAST_MESSAGE_TO_CHANNEL":
                message = {
                    action: 'MESSAGE',
                    channelId: evt.channelId,
                    channelName: evt.channelName,
                    payload: evt.payload,
                };
                break;
            case "CHANNEL_SHUTDOWN":
                message = {
                    action: 'CHANNEL_ERROR',
                    channelId: evt.channelId,
                    channelName: evt.channelName,
                    payload: {
                        error: 'The channel has shutdown unexpectedly',
                    },
                };
                break;
            case "DISCONNECT_CLIENT":
                message = {
                    action: 'DISCONNECT_CLIENT',
                    channelId: 'END_POINT',
                    channelName: 'END_POINT',
                    payload: {
                        message: 'You have been disconnected by the server',
                    }
                };
                break;
            case "DISCONNECT_CLIENT_FROM_CHANNEL":
                message = {
                    action: 'DISCONNECT_CLIENT',
                    channelId: evt.channelId,
                    channelName: evt.channelName,
                    payload: {
                        message: 'You have been kicked from the channel',
                    }
                };
                break;
            case 'SERVER_ERROR':
                message = {
                    action: 'SERVER_ERROR',
                    channelId: 'END_POINT',
                    channelName: 'END_POINT',
                    payload: {
                        error: evt.reason,
                    }
                };
        }
        socket.send(JSON.stringify(message));
        if (evt.event === 'DISCONNECT_CLIENT')
            socket.close();
        else if (evt.event === 'DISCONNECT_CLIENT_FROM_CHANNEL') {
            var channel = (_a = this.interpreter.state.context.channels.find(function (channel) { return channel.state.context.channelName === evt.channelName; })) === null || _a === void 0 ? void 0 : _a.value;
            if (!channel)
                return this.sendError(clientId, 'No such channel exists', true, evt.channelId, evt.channelName);
            channel.send({
                type: 'leaveRoom',
                clientId: evt.channelId,
            });
        }
    };
    /**
     * @desc Handles a client's messages to the server
     * @param msg - the message received from the client
     * @param assigns - the assigns of the client
     */
    EndpointMachine.prototype.handleClientMessage = function (msg, assigns) {
        var _a;
        try {
            var data_1 = JSON.parse(msg);
            var channel = (_a = this.interpreter.state.context.channels.find(function (channel) { return channel.state.context.channelName === data_1.channelName; })) === null || _a === void 0 ? void 0 : _a.value;
            switch (data_1.action) {
                case 'JOIN_CHANNEL':
                    this.interpreter.send({
                        type: 'joinChannelRequest',
                        data: {
                            channelName: data_1.channelName,
                            assigns: assigns,
                            clientId: assigns.clientId,
                        }
                    });
                    break;
                case 'LEAVE_CHANNEL':
                    if (!channel)
                        return this.sendError(assigns.clientId, 'No such channel exists', true, assigns.channelId, assigns.channelName);
                    channel.send({
                        type: 'leaveRoom',
                        clientId: assigns.clientId,
                    });
                    break;
                case 'SEND_MESSAGE':
                    if (!channel || data_1.addresses === undefined || data_1.addresses.length === 0)
                        return this.sendError(assigns.clientId, 'Invalid arguments provided', true, assigns.channelId, data_1.channelName);
                    channel.send({
                        type: 'sendMessage',
                        message: __assign(__assign({}, data_1.payload), { event: data_1.event }),
                        clientId: assigns.clientId,
                        assigns: assigns.presence,
                        presence: assigns.presencd,
                        targets: data_1.addresses
                    });
                    break;
                case "BROADCAST_MESSAGE":
                    if (!channel)
                        return this.sendError(assigns.clientId, 'No such channel exists', true, assigns.channelId, data_1.channelName);
                    channel.send({
                        type: 'sendMessage',
                        message: __assign(__assign({}, data_1.payload), { event: data_1.event }),
                        clientId: assigns.clientId,
                        assigns: assigns.presence,
                        presence: assigns.presencd,
                        targets: 'all'
                    });
                    break;
                case "BROADCAST_FROM":
                    if (!channel)
                        return this.sendError(assigns.clientId, 'No such channel exists', true, assigns.channelId, data_1.channelName);
                    channel.send({
                        type: 'sendMessage',
                        message: __assign(__assign({}, data_1.payload), { event: data_1.event }),
                        clientId: assigns.clientId,
                        assigns: assigns.presence,
                        presence: assigns.presencd,
                        targets: 'allExcept'
                    });
                    break;
            }
        }
        catch (e) {
            this.sendError(assigns.clientId, e.message, false, 'END_POINT', 'END_POINT');
        }
    };
    /**
     * @desc Sends an error message to the client
     * @param clientId - The client id of the client to send the error to
     * @param error - The error message to send
     * @param isChannel - Whether the error is a channel error or a client error
     * @param channelId - The id for channel in which the error occurred in
     * @param channelName - The name for channel in which the error occurred in
     * @private
     */
    EndpointMachine.prototype.sendError = function (clientId, error, isChannel, channelId, channelName) {
        if (isChannel) {
            var message = {
                type: 'SERVER',
                event: 'CHANNEL_ERROR',
                channelId: channelId,
                channelName: channelName,
                reason: error,
                addresses: [clientId],
            };
            this.interpreter.state.context.observable.next(message);
        }
        else {
            var message = {
                type: 'SERVER',
                event: 'SERVER_ERROR',
                addresses: [clientId],
                reason: error,
            };
            this.interpreter.state.context.observable.next(message);
        }
    };
    return EndpointMachine;
}());
exports.EndpointMachine = EndpointMachine;
