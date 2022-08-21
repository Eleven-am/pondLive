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
exports.Channel = void 0;
var rxjs_1 = require("rxjs");
var xstate_1 = require("xstate");
var base_1 = require("./base");
var Channel = /** @class */ (function () {
    function Channel(channel, roomData, verifiers) {
        this.channel = channel;
        this._roomData = roomData;
        this._isActive = false;
        this._messageEventVerifiers = verifiers;
        this._state$ = new rxjs_1.Subject();
        this.init();
    }
    Object.defineProperty(Channel.prototype, "roomData", {
        /**
         * @desc Getter for the room data of the channel
         */
        get: function () {
            return this._roomData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "state", {
        /**
         * @desc checks if the channel is active
         */
        get: function () {
            return this._isActive ? 'active' : 'inactive';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "context", {
        /**
         * @desc Getter for the context of the state machine
         */
        get: function () {
            var _a;
            return (_a = this._interpreter) === null || _a === void 0 ? void 0 : _a.state.context;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @desc adds the user to the channel
     * @param event - The event that triggered the transition
     */
    Channel.prototype.addSocket = function (event) {
        var _a, _b, _c;
        var roomData = event.roomData, clientId = event.clientId;
        this._roomData = __assign(__assign({}, this._roomData), roomData);
        var client = (_a = this.context) === null || _a === void 0 ? void 0 : _a.presences.get(clientId);
        if (client) {
            var message_1 = {
                topic: "JOIN_ROOM_RESPONSE",
                channel: this.channel,
                payload: {
                    status: "failure",
                    response: {
                        error: "already_joined",
                    }
                }
            };
            event.socket.send(JSON.stringify(message_1));
            return;
        }
        var subscription = this.subscribeToState(event);
        var message = {
            topic: "JOIN_ROOM_RESPONSE",
            channel: this.channel,
            payload: {
                status: "success",
                response: {}
            }
        };
        event.socket.send(JSON.stringify(message));
        (_b = this._interpreter) === null || _b === void 0 ? void 0 : _b.send({
            type: 'joinRoom',
            clientId: clientId,
            data: event
        });
        (_c = this._interpreter) === null || _c === void 0 ? void 0 : _c.onStop(function () {
            subscription.unsubscribe();
        });
    };
    /**
     * @desc removes the user from the channel
     * @param clientId - The client id of the user
     */
    Channel.prototype.removeSocket = function (clientId) {
        var _a;
        (_a = this._interpreter) === null || _a === void 0 ? void 0 : _a.send({
            type: 'leaveRoom',
            clientId: clientId
        });
    };
    /**
     * @desc broadcasts a message to the channel
     * @param event - The event that triggered the message
     * @param message - The message to broadcast
     */
    Channel.prototype.broadcast = function (event, message) {
        console.log('broadcasting', event, message);
    };
    /**
     * @desc broadcasts from a user to a message to the channel
     * @param clientId - The client id of the user
     * @param event - The event that triggered the message
     * @param message - The message to broadcast
     */
    Channel.prototype.broadcastFrom = function (clientId, event, message) {
        console.log('broadcasting from', clientId, event, message);
    };
    /**
     * @desc sends a message to a user
     * @param clientId - The client id of the user
     * @param event - The event that triggered the message
     * @param message - The message to send
     */
    Channel.prototype.privateMessage = function (clientId, event, message) {
        console.log('private messaging', clientId, event, message);
    };
    Object.defineProperty(Channel.prototype, "presenceList", {
        /**
         * @desc Gets the presence list of the channel
         */
        get: function () {
            var _a;
            return ((_a = this.context) === null || _a === void 0 ? void 0 : _a.presences.toArray()) || [];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "room", {
        /**
         * @desc Getter for the internal channel
         * @private
         */
        get: function () {
            var _this = this;
            return {
                getPresenceList: function () { return _this.presenceList; },
                getRoomData: function () { return _this._roomData; },
                disconnect: this.removeSocket.bind(this),
                broadcast: this.broadcast.bind(this),
                broadcastFrom: this.broadcastFrom.bind(this),
                send: this.privateMessage.bind(this)
            };
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @desc initialises the channel
     * @private
     */
    Channel.prototype.init = function () {
        var _this = this;
        var _a;
        var stateMachine = (0, xstate_1.createMachine)({
            tsTypes: {},
            schema: {
                context: {},
                events: {},
                services: {},
            },
            states: {
                idle: {
                    on: {
                        updatePresence: {
                            actions: "modifyPresence",
                            target: "idle",
                            internal: false,
                        },
                        leaveRoom: [
                            {
                                actions: "modifyPresence",
                                cond: "atLeastOneUser",
                                target: "idle",
                                internal: false,
                            },
                            {
                                actions: "shutDownChannel",
                                target: "shutDownRoom",
                            },
                        ],
                        joinRoom: {
                            actions: "modifyPresence",
                            target: "idle",
                            internal: false,
                        },
                        sendMessage: {
                            target: "authoriseMessage",
                        },
                        errorMessage: {
                            actions: "sendErrorMessage",
                            target: "idle",
                            internal: false,
                        },
                    },
                },
                shutDownRoom: {
                    type: "final",
                },
                authoriseMessage: {
                    invoke: {
                        src: "canPerformAction",
                        onDone: [
                            {
                                actions: "sendTheMessages",
                                target: "idle",
                            },
                        ],
                        onError: [
                            {
                                actions: "sendErrorMessage",
                                target: "idle",
                            },
                        ],
                    },
                },
            },
            context: {
                presences: new base_1.BaseMap(),
                assigns: new base_1.BaseMap(),
            },
            predictableActionArguments: true,
            id: this.channel,
            initial: "idle",
        }, {
            actions: {
                modifyPresence: function (ctx, evt) { return _this.modifyPresence(ctx, evt); },
                sendTheMessages: function (ctx, evt) { return _this.sendTheMessages(ctx, evt.data); },
                sendErrorMessage: function (ctx, evt) { return _this.sendErrorMessage(ctx, evt); },
                shutDownChannel: function (ctx, evt) { return _this.shutDownChannel(ctx, evt); },
            },
            guards: {
                atLeastOneUser: function (ctx, evt) { return Channel.atLeastOneUser(ctx, evt); },
            },
            services: {
                canPerformAction: function (ctx, evt) { return _this.canPerformAction(ctx, evt); },
            }
        });
        this._interpreter = (0, xstate_1.interpret)(stateMachine).start();
        (_a = this._interpreter) === null || _a === void 0 ? void 0 : _a.subscribe(function (state) {
            console.log(state.value);
        });
        this._isActive = true;
    };
    /**
     * @desc Checks if the channel has at least one user
     */
    Channel.atLeastOneUser = function (ctx, evt) {
        return ctx.presences.allExcept(evt.clientId).length > 0;
    };
    /**
     * @desc Modifies the of the users in the channel
     * @param context - The current context of the state machine
     * @param event - The event that triggered the transition
     * @private
     */
    Channel.prototype.modifyPresence = function (context, event) {
        var presence = context.presences.get(event.clientId);
        var leaves = [__assign(__assign({}, presence), { id: event.clientId })];
        var timestamp = new Date().toISOString();
        switch (event.type) {
            case 'updatePresence':
                if (presence) {
                    var updateFSMPresence = __assign(__assign({}, event.presence), { id: event.clientId });
                    this._state$.next({
                        emitter: 'channelMessage',
                        channel: this.channel,
                        event: 'presenceChange',
                        timestamp: timestamp,
                        addresses: Array.from(context.presences.keys()),
                        payload: { joins: [updateFSMPresence], leaves: leaves },
                        senderId: event.clientId,
                    });
                    (0, xstate_1.assign)({
                        presences: new base_1.BaseMap(context.presences.set(event.clientId, updateFSMPresence)),
                    });
                }
                break;
            case 'leaveRoom':
                this._state$.next({
                    channel: this.channel,
                    event: 'presenceChange',
                    emitter: 'channelMessage',
                    timestamp: timestamp,
                    addresses: context.presences.allExcept(event.clientId).map(function (p) { return p.id; }),
                    payload: { joins: [], leaves: leaves },
                    senderId: event.clientId,
                });
                (0, xstate_1.assign)({
                    presences: new base_1.BaseMap(context.presences.deleteKey(event.clientId)),
                    assigns: new base_1.BaseMap(context.assigns.deleteKey(event.clientId)),
                });
                break;
            case 'joinRoom':
                var currentPresence = context.presences.allExcept(event.clientId);
                (0, xstate_1.assign)({
                    presences: new base_1.BaseMap(context.presences.set(event.clientId, __assign({}, event.data.presence))),
                    assigns: new base_1.BaseMap(context.assigns.set(event.clientId, __assign({}, event.data.assigns))),
                });
                this._state$.next({
                    timestamp: timestamp,
                    channel: this.channel,
                    event: 'presenceBrief',
                    addresses: [event.clientId],
                    emitter: 'channelMessage',
                    payload: { currentPresence: currentPresence },
                    senderId: event.clientId,
                });
                this._state$.next({
                    channel: this.channel,
                    event: 'presenceChange',
                    emitter: 'channelMessage',
                    timestamp: timestamp,
                    payload: { joins: [__assign(__assign({}, event.data.presence), { id: event.clientId })], leaves: [] },
                    addresses: Array.from(context.presences.keys()),
                    senderId: event.clientId,
                });
                break;
        }
    };
    /**
     * @desc sends an error message to the user in the channel
     * @param _context - The current context of the state machine
     * @param event - The event that triggered the transition
     */
    Channel.prototype.sendErrorMessage = function (_context, event) {
        var message = {
            channel: this.channel,
            event: 'errorMessage',
            emitter: 'channelMessage',
            addresses: event.data.data.addresses,
            senderId: event.data.data.clientId,
            timestamp: new Date().toISOString(),
            payload: {
                message: event.data.errorMessage,
                errorCode: event.data.errorCode,
            }
        };
        this._state$.next(message);
    };
    /**
     * @desc sends the message to the users in the channel
     * @param context - The current context of the state machine
     * @param event - The event that triggered the transition
     */
    Channel.prototype.sendTheMessages = function (context, event) {
        var addresses = Array.from(context.presences.keys());
        var broadcastType = 'broadcast';
        if (event.targets !== 'all') {
            if (event.targets === 'allExcept') {
                broadcastType = 'broadcastFrom';
                addresses = addresses.filter(function (p) { return p !== event.clientId; });
            }
            else {
                addresses = event.targets;
                broadcastType = 'privateMessage';
            }
        }
        var message = {
            channel: this.channel,
            event: broadcastType,
            addresses: addresses,
            emitter: 'channelMessage',
            senderId: event.clientId,
            timestamp: new Date().toISOString(),
            payload: event.message,
        };
        this._state$.next(message);
        (0, xstate_1.assign)({
            assigns: new Map(context.assigns.set(event.clientId, __assign(__assign({}, context.assigns.get(event.clientId)), event.assigns))),
        });
    };
    /**
     * @desc shuts down the channel
     * @param _context - The current context of the state machine
     * @param _event - The event that triggered the transition
     */
    Channel.prototype.shutDownChannel = function (_context, _event) {
        var _a;
        this._state$.complete();
        (_a = this._interpreter) === null || _a === void 0 ? void 0 : _a.stop();
        this._isActive = false;
    };
    /**
     * @desc subscribes to the state of the channel
     */
    Channel.prototype.subscribeToState = function (event) {
        var _this = this;
        var clientId = event.clientId, socket = event.socket;
        var subscription = this._state$.subscribe(function (state) {
            if (state.emitter === 'channelMessage' && state.addresses.includes(clientId)) {
                if (state.event === 'presenceBrief') {
                    var data = {
                        topic: 'PRESENCE_BRIEF',
                        channel: _this.channel,
                        payload: {
                            presence: state.payload.currentPresence,
                            response: {}
                        }
                    };
                    var message = JSON.stringify(data);
                    socket.send(message);
                }
                else if (state.event === 'presenceChange') {
                    var data = {
                        topic: 'PRESENCE_UPDATE',
                        channel: _this.channel,
                        payload: {
                            joins: state.payload.joins,
                            leaves: state.payload.leaves,
                            response: {}
                        }
                    };
                    var message = JSON.stringify(data);
                    socket.send(message);
                }
                else if (state.event === 'broadcast') {
                    var data = {
                        topic: 'MESSAGE',
                        channel: _this.channel,
                        sender: 'server',
                        payload: {
                            message: state.payload,
                            response: {},
                            sentBy: state.senderId,
                            timestamp: new Date().toISOString()
                        }
                    };
                    var message = JSON.stringify(data);
                    socket.send(message);
                }
                else if (state.event === 'errorMessage') {
                    var data = {
                        topic: 'ERROR_MESSAGE',
                        channel: _this.channel,
                        sender: 'server',
                        payload: {
                            error: state.payload.message,
                            errorCode: state.payload.errorCode,
                            response: {}
                        }
                    };
                    var message = JSON.stringify(data);
                    socket.send(message);
                }
                else
                    console.log("Sending message to " + clientId, state);
                // todo: check if the message is from the server
                // todo: check if the message is for the user
            }
        });
        this.subscribeToSocket(event, subscription);
        return subscription;
    };
    /**
     * @desc subscribes to the state of the socket
     * @param event - The event that triggered the transition
     * @param subscription - The subscription to the socket state
     */
    Channel.prototype.subscribeToSocket = function (event, subscription) {
        var _this = this;
        var socket = event.socket, clientId = event.clientId;
        socket.on('message', function (message) { return __awaiter(_this, void 0, void 0, function () {
            var data, message_2, assigns, presence, targets, error_1;
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.readMessage(message, clientId)];
                    case 1:
                        data = _f.sent();
                        if (data.topic === 'LEAVE_ROOM_REQUEST') {
                            (_a = this._interpreter) === null || _a === void 0 ? void 0 : _a.send({
                                type: 'leaveRoom',
                                clientId: clientId
                            });
                            subscription.unsubscribe();
                        }
                        else if (data.topic === 'MESSAGE' && data.payload.event) {
                            message_2 = null;
                            assigns = ((_b = this.context) === null || _b === void 0 ? void 0 : _b.assigns.get(clientId)) || {};
                            presence = this.presenceList || [];
                            if (data.mode === 'BROADCAST')
                                message_2 = {
                                    type: 'sendMessage',
                                    clientId: clientId,
                                    assigns: assigns,
                                    message: __assign(__assign({}, data.payload.message), { event: data.payload.event }),
                                    targets: 'all'
                                };
                            else if (data.mode === 'BROADCAST_EXCEPT_SELF') {
                                targets = presence.filter(function (presence) { return presence.id !== clientId; }).map(function (presence) { return presence.id; });
                                message_2 = {
                                    type: 'sendMessage',
                                    clientId: clientId,
                                    assigns: assigns,
                                    targets: targets,
                                    message: __assign(__assign({}, data.payload.message), { event: data.payload.event }),
                                };
                            }
                            else if (data.mode === 'BROADCAST_TO_ASSIGNED' && data.payload.assignedTo)
                                message_2 = {
                                    type: 'sendMessage',
                                    clientId: clientId,
                                    assigns: assigns,
                                    targets: data.payload.assignedTo,
                                    message: __assign(__assign({}, data.payload.message), { event: data.payload.event }),
                                };
                            if (message_2 !== null)
                                (_c = this._interpreter) === null || _c === void 0 ? void 0 : _c.send(message_2);
                            else
                                (_d = this._interpreter) === null || _d === void 0 ? void 0 : _d.send({
                                    type: 'errorMessage',
                                    data: new base_1.PondError('Invalid message mode', 400, {
                                        addresses: [clientId],
                                        clientId: clientId,
                                    })
                                });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _f.sent();
                        (_e = this._interpreter) === null || _e === void 0 ? void 0 : _e.send({
                            type: 'errorMessage',
                            data: error_1
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        socket.onclose = function () {
            var _a;
            (_a = _this._interpreter) === null || _a === void 0 ? void 0 : _a.send({
                type: 'leaveRoom',
                clientId: clientId
            });
            subscription.unsubscribe();
        };
        socket.onerror = function () {
            var _a;
            (_a = _this._interpreter) === null || _a === void 0 ? void 0 : _a.send({
                type: 'leaveRoom',
                clientId: clientId
            });
            subscription.unsubscribe();
        };
    };
    /**
     * @desc checks if the user can perform the action
     * @param context - The current context of the state machine
     * @param event - The event that triggered the transition
     */
    Channel.prototype.canPerformAction = function (context, event) {
        var _this = this;
        return (0, base_1.BasePromise)(function (resolve, reject) {
            var message = event.message;
            var verifier = _this._messageEventVerifiers.get(event.message.event);
            var client = context.presences.get(event.clientId);
            if (!client)
                return reject('Action forbidden: You are currently not in the channel', 403, {
                    addresses: [event.clientId],
                    clientId: event.clientId
                });
            delete message.event;
            if (verifier) {
                var newAssigns_1 = event.assigns;
                var newPresence_1 = client;
                var getAssigns = function (assigns) {
                    if (assigns) {
                        newAssigns_1 = __assign(__assign({}, newAssigns_1), assigns.assigns);
                        newPresence_1 = __assign(__assign({}, newPresence_1), assigns.presence);
                    }
                    resolve({
                        targets: event.targets,
                        clientId: event.clientId,
                        message: JSON.stringify(message),
                        presence: newPresence_1,
                        assigns: newAssigns_1,
                    });
                };
                var deny = function (errorMessage) {
                    reject(errorMessage, 403, { addresses: [event.clientId], clientId: event.clientId });
                };
                var outbound = {
                    accept: getAssigns,
                    decline: deny,
                    room: _this.room,
                    request: {
                        message: event.message,
                        targets: event.targets,
                        clientId: event.clientId,
                        assigns: event.assigns,
                    }
                };
                verifier(outbound);
            }
            else
                return resolve({
                    message: JSON.stringify(message),
                    clientId: event.clientId,
                    targets: event.targets,
                    assigns: event.assigns,
                    presence: client,
                });
        });
    };
    /**
     * @desc Reads socket message from the client
     * @param message - The message from the client
     * @param clientId - The client id of the client
     */
    Channel.prototype.readMessage = function (message, clientId) {
        var _this = this;
        return (0, base_1.BasePromise)(function (resolve, reject) {
            var _a;
            try {
                var data = JSON.parse(message);
                if (data.channel && data.channel === _this.channel)
                    if ((_a = _this.context) === null || _a === void 0 ? void 0 : _a.presences.has(clientId))
                        resolve(data);
                    else
                        reject('Action forbidden: You are currently not in the channel', 403, {
                            addresses: [clientId],
                            clientId: clientId
                        });
            }
            catch (e) {
                return reject(e.message, 500, { addresses: [clientId], clientId: clientId });
            }
        });
    };
    return Channel;
}());
exports.Channel = Channel;
