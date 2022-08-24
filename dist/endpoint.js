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
var xstate_1 = require("xstate");
var utils_1 = require("./utils");
var channel_1 = require("./channel");
var PondEndpoint = /** @class */ (function () {
    function PondEndpoint(endpoint) {
        this.endpoint = endpoint;
    }
    Object.defineProperty(PondEndpoint.prototype, "context", {
        /**
         * @desc Gets the context of the endpoint machine.
         * @private
         */
        get: function () {
            return this.endpoint.state.context;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @desc Gets a channel by id from the endpoint.
     * @param channelId - The id of the channel to get.
     * @private
     */
    PondEndpoint.prototype.getPrivateChannel = function (channelId) {
        return this.context.channels.get(channelId) || null;
    };
    /**
     * @desc Broadcasts a message to all clients in the endpoint.
     * @param event - The event to broadcast.
     * @param message - The message to broadcast.
     */
    PondEndpoint.prototype.broadcast = function (event, message) {
        var observable = this.context.observable;
        var sockets = this.context.channels.toKeyValueArray().map(function (_a) {
            var value = _a.value;
            return value.state.context.presences.toArray();
        }).flat();
        var addresses = sockets.map(function (a) { return a.id; });
        observable.next({
            type: 'SERVER',
            subEvent: event,
            event: 'BROADCAST_MESSAGE',
            addresses: addresses,
            payload: message
        });
    };
    /**
     * @desc Sends a message to a channel in the endpoint.
     * @param channelId - The id of the channel to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    PondEndpoint.prototype.broadcastToChannel = function (channelId, event, message) {
        var observable = this.context.observable;
        var channel = this.getPrivateChannel(channelId);
        if (channel)
            observable.next({
                type: 'SERVER',
                channelId: channelId,
                subEvent: event,
                channelName: channel.state.context.channelName,
                event: 'BROADCAST_MESSAGE_TO_CHANNEL',
                addresses: Array.from(channel.state.context.presences.keys()),
                payload: message
            });
    };
    /**
     * @desc Disconnects a client from the endpoint.
     * @param clientId - The id of the client to disconnect.
     */
    PondEndpoint.prototype.close = function (clientId) {
        var observable = this.context.observable;
        observable.next({
            type: 'SERVER',
            event: 'DISCONNECT_CLIENT',
            addresses: [clientId],
        });
    };
    /**
     * @desc Closes a client connection to a channel in the endpoint.
     * @param channelId - The id of the channel to close the connection to.
     * @param clientId - The id of the client to close the connection to.
     */
    PondEndpoint.prototype.closeFromChannel = function (channelId, clientId) {
        var observable = this.context.observable;
        var channel = this.getPrivateChannel(channelId);
        if (channel)
            observable.next({
                type: 'SERVER',
                channelId: channelId,
                channelName: channel.state.context.channelName,
                event: 'DISCONNECT_CLIENT_FROM_CHANNEL',
                addresses: [clientId],
                payload: {}
            });
    };
    /**
     * @desc Accepts a new socket join request to the room provided using the handler function to authorise the socket
     * @param path - the pattern to accept || can also be a regex
     * @param handler - the handler function to authenticate the socket
     *
     * @example
     * const channel = endpoint.createChannel('channel:*', (req, res) => {
     *   const isAdmin = req.assigns.admin;
     *   if (!isAdmin)
     *      return res.decline('You are not an admin');
     *
     *   res.accept({assigns: {admin: true, joinedDate: new Date()}, presence: {state: online}, channelData: {private: true}});
     * });
     *
     * channel.on('ping', (req, res, channel) => {
     *     const users = channel.getPresence();
     *     res.assign({pingDate: new Date(), users: users.length});
     * })
     */
    PondEndpoint.prototype.createChannel = function (path, handler) {
        var events = new utils_1.BaseMap();
        (0, xstate_1.assign)({
            authorizers: new utils_1.BaseMap(this.context.authorizers.set(path, { handler: handler, events: events })),
        });
        return {
            on: function (event, handler) {
                events.set(event, handler);
            }
        };
    };
    /**
     * @desc Gets a channel by id from the endpoint.
     * @param channelId - The id of the channel to get.
     */
    PondEndpoint.prototype.getChannel = function (channelId) {
        var channel = this.getPrivateChannel(channelId);
        if (channel) {
            var _a = channel.state.context, channelName = _a.channelName, channelId_1 = _a.channelId;
            return new channel_1.InternalPondChannel(channelName, channelId_1, channel);
        }
        return null;
    };
    /**
     * @desc Gets a channel's data by id from the endpoint.
     * @param channelId - The id of the channel to get the data of.
     */
    PondEndpoint.prototype.getChannelData = function (channelId) {
        var channel = this.getPrivateChannel(channelId);
        if (channel)
            return channel.state.context.channelData;
        return {};
    };
    /**
     * @desc Gets a channel's presence by id from the endpoint.
     * @param channelId - The id of the channel to get the presence of.
     */
    PondEndpoint.prototype.getPresence = function (channelId) {
        var channel = this.getPrivateChannel(channelId);
        if (channel)
            return channel.state.context.presences.toArray();
        return [];
    };
    /**
     * @desc Sends a message to a client on the endpoint.
     * @param clientId - The id of the client to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    PondEndpoint.prototype.send = function (clientId, event, message) {
        var observable = this.context.observable;
        observable.next({
            type: 'SERVER',
            event: 'BROADCAST_MESSAGE',
            addresses: Array.isArray(clientId) ? clientId : [clientId],
            subEvent: event,
            payload: message
        });
    };
    /**
     * @desc Modify the presence of a client in a channel on the endpoint.
     * @param channelId - The id of the channel to modify the presence of.
     * @param clientId - The id of the client to modify the presence of.
     * @param assigns - The assigns to modify the presence with.
     */
    PondEndpoint.prototype.modifyPresence = function (channelId, clientId, assigns) {
        var channel = this.getPrivateChannel(channelId);
        if (channel) {
            var clientPresence = channel.state.context.presences.get(clientId);
            var clientAssigns = channel.state.context.assigns.get(clientId);
            if (clientPresence && clientAssigns) {
                var internalAssigns = __assign(__assign({}, clientAssigns), assigns.assign);
                var internalPresence = __assign(__assign({}, clientPresence), assigns.presence);
                channel.send({
                    type: 'updatePresence',
                    clientId: clientId,
                    presence: internalPresence,
                    assigns: internalAssigns,
                });
            }
        }
    };
    return PondEndpoint;
}());
exports.default = PondEndpoint;
