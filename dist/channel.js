"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondEndpoint = exports.PondChannel = exports.InternalPondChannel = void 0;
var utils_1 = require("./utils");
var InternalPondChannel = /** @class */ (function () {
    function InternalPondChannel(channel) {
        this.channel = channel;
    }
    Object.defineProperty(InternalPondChannel.prototype, "presence", {
        /**
         * @desc Gets the current presence of the channel
         */
        get: function () {
            return this.channel.presenceList;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InternalPondChannel.prototype, "channelData", {
        /**
         * @desc Gets the current channel data
         */
        get: function () {
            return this.channel.channelData;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @desc Modifies the presence state of a client on the channel
     * @param clientId - The clientId to modify the presence of
     * @param assigns - The assigns to modify the presence with
     */
    InternalPondChannel.prototype.modifyPresence = function (clientId, assigns) {
        this.channel.updateUser(clientId, assigns.presence || {}, assigns.assign || {});
    };
    /**
     * @desc Closes the channel from the given clientId
     * @param clientId - The clientId to close the channel from, can be an array of clientIds
     */
    InternalPondChannel.prototype.closeFromChannel = function (clientId) {
        var _this = this;
        var clientIds = Array.isArray(clientId) ? clientId : [clientId];
        clientIds.forEach(function (id) { return _this.channel.removeUser(id); });
        var newMessage = {
            action: 'KICKED_FROM_CHANNEL',
            channelName: this.channel.channelName,
            event: '', payload: {},
            addresses: clientIds,
            clientId: this.channel.channelId,
        };
        this.channel.sendToClients(newMessage);
    };
    /**
     * @desc Broadcasts a message to the channel
     * @param event - The event to send the message to
     * @param message - The message to send
     */
    InternalPondChannel.prototype.broadcast = function (event, message) {
        var clients = this.channel.clientIds;
        var newMessage = {
            action: 'MESSAGE', clientId: 'SERVER',
            channelName: this.channel.channelName,
            event: event,
            payload: message, addresses: clients
        };
        this.channel.sendToClients(newMessage);
    };
    /**
     * @desc Sends a message to the channel
     * @param clientId - The clientId to send the message to, can be an array of clientIds
     * @param event - The event to send the message to
     * @param message - The message to send
     */
    InternalPondChannel.prototype.send = function (clientId, event, message) {
        var clients = Array.isArray(clientId) ? clientId : [clientId];
        var newMessage = {
            action: 'MESSAGE', clientId: 'SERVER',
            channelName: this.channel.channelName,
            event: event,
            payload: message, addresses: clients
        };
        this.channel.sendToClients(newMessage);
    };
    return InternalPondChannel;
}());
exports.InternalPondChannel = InternalPondChannel;
var PondChannel = /** @class */ (function () {
    function PondChannel(channels, events) {
        this.channels = channels;
        this.events = events;
    }
    /**
     * @desc A listener for a channel event
     * @param event - The event to listen for, can be a regex
     * @param callback - The callback to call when the event is received
     */
    PondChannel.prototype.on = function (event, callback) {
        this.events.set(event, callback);
    };
    /**
     * @desc Gets a channel's data by id from the endpoint.
     * @param channelId - The id of the channel to get the data of.
     */
    PondChannel.prototype.getChannelData = function (channelId) {
        var channel = this.getPrivateChannel(channelId);
        if (channel)
            return channel.channelData;
        return {};
    };
    /**
     * @desc Gets a channel's presence by id from the endpoint.
     * @param channelId - The id of the channel to get the presence of.
     */
    PondChannel.prototype.getPresence = function (channelId) {
        var channel = this.getPrivateChannel(channelId);
        if (channel)
            return channel.presence;
        return [];
    };
    /**
     * @desc Sends a message to a channel in the endpoint.
     * @param channelId - The id of the channel to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    PondChannel.prototype.broadcastToChannel = function (channelId, event, message) {
        var channel = this.getPrivateChannel(channelId);
        if (channel)
            channel.broadcast(event, message);
    };
    /**
     * @desc Closes a client connection to a channel in the endpoint.
     * @param channelId - The id of the channel to close the connection to.
     * @param clientId - The id of the client to close the connection to.
     */
    PondChannel.prototype.closeFromChannel = function (channelId, clientId) {
        var channel = this.getPrivateChannel(channelId);
        if (channel)
            channel.closeFromChannel(clientId);
    };
    /**
     * @desc Modify the presence of a client in a channel on the endpoint.
     * @param channelId - The id of the channel to modify the presence of.
     * @param clientId - The id of the client to modify the presence of.
     * @param assigns - The assigns to modify the presence with.
     */
    PondChannel.prototype.modifyPresence = function (channelId, clientId, assigns) {
        var channel = this.getPrivateChannel(channelId);
        if (channel)
            channel.modifyPresence(clientId, assigns);
    };
    /**
     * @desc Gets a channel by id from the endpoint.
     * @param channelId - The id of the channel to get.
     * @private
     */
    PondChannel.prototype.getPrivateChannel = function (channelId) {
        var channel = this.channels.get(channelId) || null;
        if (!channel)
            return null;
        return new InternalPondChannel(channel);
    };
    return PondChannel;
}());
exports.PondChannel = PondChannel;
var PondEndpoint = /** @class */ (function () {
    function PondEndpoint(endpoint) {
        this.endpoint = endpoint;
        this.listen();
    }
    /**
     * @desc Broadcasts a message to all clients in the endpoint.
     * @param event - The event to broadcast.
     * @param message - The message to broadcast.
     */
    PondEndpoint.prototype.broadcast = function (event, message) {
        var sockets = this.endpoint.socketCache.keys();
        var newMessage = {
            action: 'MESSAGE', clientId: 'SERVER',
            channelName: 'SERVER',
            event: event,
            payload: message,
            addresses: Array.from(sockets)
        };
        this.endpoint.subject.next(newMessage);
    };
    /**
     * @desc Disconnects a client from the endpoint.
     * @param clientId - The id of the client to disconnect.
     */
    PondEndpoint.prototype.close = function (clientId) {
        var client = this.endpoint.socketCache.get(clientId);
        if (client)
            client.socket.close();
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
        this.endpoint.authorizers.set(path, {
            handler: handler,
            events: events
        });
        return new PondChannel(this.endpoint.channels, events);
    };
    /**
     * @desc Gets a channel by id from the endpoint.
     * @param channelId - The id of the channel to get.
     */
    PondEndpoint.prototype.getChannel = function (channelId) {
        var channel = this.getPrivateChannel(channelId);
        if (channel)
            return new InternalPondChannel(channel);
        return null;
    };
    /**
     * @desc Sends a message to a client on the endpoint.
     * @param clientId - The id of the client to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    PondEndpoint.prototype.send = function (clientId, event, message) {
        var newMessage = {
            action: 'MESSAGE', clientId: 'SERVER',
            channelName: 'SERVER',
            event: event,
            payload: message,
            addresses: Array.isArray(clientId) ? clientId : [clientId]
        };
        this.endpoint.subject.next(newMessage);
    };
    /**
     * @desc Closes a client connection to the endpoint.
     * @param clientId - The id of the client to close the connection to.
     */
    PondEndpoint.prototype.closeConnection = function (clientId) {
        var message = {
            action: 'CLOSED_FROM_SERVER', clientId: 'SERVER',
            channelName: 'SERVER', event: 'CLOSED_FROM_SERVER', payload: {},
            addresses: [clientId]
        };
        this.endpoint.subject.next(message);
    };
    /**
     * @desc Gets a channel by id from the endpoint.
     * @param channelId - The id of the channel to get.
     * @private
     */
    PondEndpoint.prototype.getPrivateChannel = function (channelId) {
        return this.endpoint.channels.get(channelId) || null;
    };
    /**
     * @desc Listen for a message on the subject.
     * @private
     */
    PondEndpoint.prototype.listen = function () {
        var _this = this;
        this.endpoint.subject
            .subscribe(function (message) {
            if (message.action === 'CHANNEL_DESTROY') {
                _this.endpoint.channels.deleteKey(message.clientId);
                return;
            }
        });
    };
    return PondEndpoint;
}());
exports.PondEndpoint = PondEndpoint;
