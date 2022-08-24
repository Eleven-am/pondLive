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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelMachine = void 0;
var xstate_1 = require("xstate");
var utils_1 = require("./utils");
var channel_1 = require("./channel");
var operators_1 = require("rxjs/operators");
var ChannelMachine = /** @class */ (function () {
    function ChannelMachine(context, parent) {
        this.interpreter = this.start(context);
        this.base = new utils_1.BaseClass();
        this.parent = parent;
        this.listenForDisconnectedClients(parent.state.context.observable);
    }
    /**
     * @desc Checks if there is at least one user in the channel
     * @param ctx - The current context
     * @param evt - The event that triggered the transition
     * @private
     */
    ChannelMachine.atLeastOneUser = function (ctx, evt) {
        return ctx.presences.allExcept(evt.clientId).length > 0;
    };
    /**
     * @desc Listens for disconnected clients
     * @param subject - The subject of the parent machine to listen to
     */
    ChannelMachine.prototype.listenForDisconnectedClients = function (subject) {
        var _this = this;
        var subscription = subject
            .pipe((0, operators_1.filter)(function (x) { return x.event === 'CLIENT_DISCONNECTED'; }), (0, operators_1.filter)(function (x) { return _this.interpreter.state.context.presences.has(x.clientId); }))
            .subscribe(function (x) {
            _this.interpreter.send({
                type: 'leaveRoom',
                clientId: x.clientId,
            });
        });
        this.interpreter.onStop(function () { return subscription.unsubscribe(); });
    };
    /**
     * @desc Starts the channel machine
     * @param context - The initial context of the channel
     * @private
     */
    ChannelMachine.prototype.start = function (context) {
        var _this = this;
        var machine = 
        /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlwgBswBiAVwAcJ0AXMABQCc4x9MxFQ9APaxczXEPwCQAD0QBGAKwB2EgDZFAJkXyAHAAZNegMz7lAGhABPRAFpjAFlUP5ATkdr97ta4euAvv6WaFh4hKTkVNRU6ABuYABKQkKo0sKi4pLScgi2urok8trGrq7yTmXGRpY2uYpqJEaammrKjmYOag4OgcEYOATEZJQ0AFZCBEkpaSJiElJIsnby6vLKutr6+m7Ku-qtNXYO+gXbrmq6xsaXFT1BICED4cNRsDwQALJwsOgwMxnzbIKeqFLrbFrKHS6NQXQ4IFQkZTaZTnUraGHyYy9B79MJDSI0MAcDhCDhfWA-P6LdJzLKLHK2NbGEidTTKfQqUxszFw2yaAyIxTGTEXfJuHxY+6PPGkdC0ZjYUm4N7kyk0CCSMBkfCxIQAay10sGsvlio4yrAqt+YAQBF1mBY8wA2voALr-WkLUA5IwORotUzCraKXSKXxwlp+hwhrYtfJI7rYo3POUKpUq77W6hEkkcEj0CgsABmpNQJGTQ1TZotVpgtp1QgdmXwLvd1NmzaBdTUmhZ+j8XTKugcl10vPk8ganhHVX7OjWakC93wQggcGkFYiIw9nfpdk0VUFMI0piULRO498jWMyjWE7Kyh8umUSdxxpIsGw8oAIkIAO74FMqTtgCdLekc2gkCouiYvykIXGYcJFKoQpdKYrj5D21yvqE75VumlqZlSggdoCe65CUfr8tsmLHJ4Xj9hGw6IpCWglO4DiOEoOFPMQO5keBdTQn2A5+HoM5jtYRwClsFwYX4jhIuUS7+EAA */
        (0, xstate_1.createMachine)({
            context: context,
            tsTypes: {},
            schema: { context: {}, events: {} },
            predictableActionArguments: true,
            id: "(machine)",
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
            initial: "idle",
        }, {
            actions: {
                modifyPresence: function (ctx, evt) { return _this.modifyPresence(ctx, evt); },
                sendTheMessages: function (ctx, evt) { return _this.sendTheMessages(ctx, evt.data); },
                sendErrorMessage: function (ctx, evt) { return _this.sendErrorMessage(ctx, evt); },
                shutDownChannel: function (ctx, evt) { return _this.shutDownChannel(ctx, evt); },
            },
            guards: {
                atLeastOneUser: function (ctx, evt) { return ChannelMachine.atLeastOneUser(ctx, evt); },
            },
            services: {
                canPerformAction: function (ctx, evt) { return _this.canPerformAction(ctx, evt); },
            }
        });
        return (0, xstate_1.interpret)(machine).start();
    };
    /**
     * @desc Modifies the presence of the channel
     * @param ctx - The current context
     * @param evt - The event that triggered the transition
     * @private
     */
    ChannelMachine.prototype.modifyPresence = function (ctx, evt) {
        var currentPresence = ctx.presences.toArrayMap(function (_a) {
            var _b = __read(_a, 2), clientId = _b[0], presence = _b[1];
            return (__assign(__assign({}, presence), { clientId: clientId }));
        });
        var updatedPresence = [];
        if (evt.type === "updatePresence") {
            updatedPresence = this.base.replaceObjectInArray(currentPresence, 'clientId', {
                clientId: evt.clientId,
                presence: evt.presence
            });
            (0, xstate_1.assign)({
                presences: new utils_1.BaseMap(ctx.presences.set(evt.clientId, evt.presence)),
                assigns: new utils_1.BaseMap(ctx.assigns.set(evt.clientId, evt.assigns))
            });
        }
        else if (evt.type === "joinRoom") {
            updatedPresence = currentPresence.concat([{ clientId: evt.clientId, presence: evt.data.presence }]);
            (0, xstate_1.assign)({
                presences: new utils_1.BaseMap(ctx.presences.set(evt.clientId, evt.data.presence)),
                assigns: new utils_1.BaseMap(ctx.assigns.set(evt.clientId, evt.data.assigns))
            });
        }
        else if (evt.type === "leaveRoom") {
            updatedPresence = currentPresence.filter(function (_a) {
                var clientId = _a.clientId;
                return clientId !== evt.clientId;
            });
            (0, xstate_1.assign)({
                presences: new utils_1.BaseMap(ctx.presences.deleteKey(evt.clientId)),
                assigns: new utils_1.BaseMap(ctx.assigns.deleteKey(evt.clientId))
            });
        }
        this.parent.state.context.observable.next({
            type: 'SERVER',
            event: 'PRESENCE_UPDATE',
            channelName: ctx.channelName,
            channelId: ctx.channelId,
            addresses: updatedPresence.map(function (_a) {
                var clientId = _a.clientId;
                return clientId;
            }),
            payload: {
                updatedPresence: updatedPresence,
            }
        });
    };
    /**
     * @desc Sends the messages to the channel's clients
     * @param ctx - The current context
     * @param evt - The event that triggered the transition
     * @private
     */
    ChannelMachine.prototype.sendTheMessages = function (ctx, evt) {
        var clientId = evt.clientId, targets = evt.targets;
        var _a = evt.message, event = _a.event, message = __rest(_a, ["event"]);
        var addresses = targets === 'all' ? Array.from(ctx.presences.keys()) : targets === 'allExcept' ? ctx.presences.allExcept(clientId).map(function (c) { return c.id; }) : targets;
        this.parent.state.context.observable.next({
            type: 'SERVER',
            event: 'BROADCAST_MESSAGE_TO_CHANNEL',
            subEvent: event,
            channelName: ctx.channelName,
            channelId: ctx.channelId,
            addresses: addresses,
            payload: message,
        });
    };
    /**
     * @desc Sends an error message to the channel's clients
     * @param ctx - The current context
     * @param evt - The event that triggered the transition
     * @private
     */
    ChannelMachine.prototype.sendErrorMessage = function (ctx, evt) {
        this.parent.state.context.observable.next({
            type: 'SERVER',
            event: 'CHANNEL_ERROR',
            channelName: ctx.channelName,
            channelId: ctx.channelId,
            addresses: evt.data.data.addresses || Array.from(ctx.presences.keys()),
            reason: evt.data.errorMessage,
        });
    };
    /**
     * @desc Shuts down the channel
     * @param ctx - The current context
     * @param _evt - The event that triggered the transition
     * @private
     */
    ChannelMachine.prototype.shutDownChannel = function (ctx, _evt) {
        this.parent.state.context.observable.next({
            type: 'SERVER',
            event: 'CHANNEL_SHUTDOWN',
            channelName: ctx.channelName,
            channelId: ctx.channelId,
            addresses: ctx.presences.toArrayMap(function (_a) {
                var _b = __read(_a, 1), clientId = _b[0];
                return clientId;
            }),
            reason: 'NO_USERS',
        });
    };
    /**
     * @desc Checks if the action can be performed by the client
     * @param ctx - The current context
     * @param evt - The event that triggered the transition
     * @private
     */
    ChannelMachine.prototype.canPerformAction = function (ctx, evt) {
        var _this = this;
        var clientId = evt.clientId;
        var _a = evt.message, event = _a.event, message = __rest(_a, ["event"]);
        return (0, utils_1.BasePromise)(function (resolve, reject) {
            var client = ctx.presences.get(clientId);
            if (!client)
                return reject('CLIENT_NOT_FOUND', 400, {
                    addresses: [clientId],
                    clientId: clientId,
                });
            var response = _this.base.generatePondResponse(function (assigns) {
                resolve(evt);
                if (assigns) {
                    var internalAssigns = __assign(__assign({}, evt.assigns), assigns.assign);
                    var internalPresence = __assign(__assign({}, evt.presence), assigns.presence);
                    _this.interpreter.send({
                        type: 'updatePresence',
                        clientId: clientId,
                        presence: internalPresence,
                        assigns: internalAssigns,
                    });
                }
            }, reject, {
                clientId: evt.clientId,
                addresses: [evt.clientId],
            });
            var request = {
                event: event,
                channelId: ctx.channelId,
                channelName: ctx.channelName,
                message: message,
                client: {
                    clientId: clientId,
                    clientAssigns: evt.assigns,
                    clientPresence: evt.presence,
                }
            };
            var verifier = ctx.verifiers.findByKey(function (path) { return _this.base.compareStringToPattern(event, path); });
            var room = new channel_1.InternalPondChannel(ctx.channelName, ctx.channelId, _this.interpreter);
            if (verifier)
                verifier.value(request, response, room);
            else
                resolve(evt);
        }, {
            clientId: evt.clientId,
            addresses: [evt.clientId],
        });
    };
    return ChannelMachine;
}());
exports.ChannelMachine = ChannelMachine;
