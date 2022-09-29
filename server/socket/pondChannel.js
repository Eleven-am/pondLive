"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondChannel = void 0;
const baseClass_1 = require("../utils/baseClass");
const pondResponse_1 = require("../utils/pondResponse");
const pondBase_1 = require("../utils/pondBase");
const channel_1 = require("./channel");
const basePromise_1 = require("../utils/basePromise");
const enums_1 = require("../enums");
class PondChannel extends baseClass_1.BaseClass {
    path;
    _handler;
    _channels;
    _subscriptions;
    _subscribers;
    constructor(path, handler) {
        super();
        this._channels = new pondBase_1.PondBase();
        this._handler = handler;
        this.path = path;
        this._subscribers = new Set();
        this._subscriptions = {};
    }
    /**
     * @desc A listener for a channel event
     * @param event - The event to listen for, can be a regex
     * @param callback - The callback to call when the event is received
     */
    on(event, callback) {
        const resolver = this._buildHandler(event, callback);
        this._subscribers.add(resolver);
        return {
            unsubscribe: () => {
                this._subscribers.delete(resolver);
            }
        };
    }
    /**
     * @desc Add new user to channel
     * @param user - The user to add to the channel
     * @param channelName - The name of the channel
     * @param joinParams - The params to join the channel with
     */
    addUser(user, channelName, joinParams) {
        return (0, basePromise_1.BasePromise)({ channelName }, async (resolve, reject) => {
            let channel;
            channel = this._channels.query(c => c.name === channelName)[0]?.doc;
            const resolved = this.generateEventRequest(this.path, channelName);
            if (!resolved)
                return reject('Invalid channel name', 400);
            if (!channel)
                channel = await this._createChannel(channelName);
            const assigns = {
                assigns: user.assigns,
                presence: {},
                channelData: channel.data,
            };
            const request = {
                joinParams, ...resolved,
                clientId: user.clientId, channelName,
                clientAssigns: user.assigns,
            };
            const resolver = (data) => {
                if (data.error)
                    return reject(data.error.errorMessage, data.error.errorCode);
                const { assigns, presence, channelData } = data.assigns;
                this._subscriptions[user.clientId] = this._subscriptions[user.clientId] || [];
                const sub = channel.subscribeToMessages(user.clientId, (event) => {
                    PondChannel._sendMessage(user.socket, event);
                });
                channel.addUser({
                    presence: presence,
                    assigns: assigns,
                    channelData: channelData,
                    client: user,
                });
                this._subscriptions[user.clientId].push({ name: channelName, sub });
                if (data.message)
                    channel.sendTo(data.message.event, data.message.payload, enums_1.PondSenders.POND_CHANNEL, [user.clientId]);
                resolve();
            };
            const response = new pondResponse_1.PondResponse({ channelName }, assigns, resolver);
            await this._handler(request, response, channel);
        });
    }
    /**
     * @desc Sends a message to a channel in the endpoint.
     * @param channelName - The name of the channel to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    broadcastToChannel(channelName, event, message) {
        this._execute(channelName, channel => {
            channel.broadcast(event, message, enums_1.PondSenders.POND_CHANNEL);
        });
    }
    /**
     * @desc Closes a client connection to a channel in the endpoint.
     * @param channelName - The name of the channel to close the connection to.
     * @param clientId - The id of the client to close the connection to.
     */
    closeFromChannel(channelName, clientId) {
        this._execute(channelName, channel => {
            this._removeSubscriptions(clientId, channelName);
            channel.removeUser(clientId);
        });
    }
    /**
     * @desc Modify the presence of a client in a channel on the endpoint.
     * @param channelName - The name of the channel to modify the presence of.
     * @param clientId - The id of the client to modify the presence of.
     * @param assigns - The assigns to modify the presence with.
     */
    modifyPresence(channelName, clientId, assigns) {
        this._execute(channelName, channel => {
            channel.updateUser(clientId, assigns.presence || {}, assigns.assigns || {});
        });
    }
    /**
     * @desc Gets the information of the channel
     * @param channelName - The name of the channel to get the information of.
     */
    getChannelInfo(channelName) {
        return this._execute(channelName, channel => {
            return channel.info;
        });
    }
    /**
     * @desc Sends a message to the channel
     * @param channelName - The name of the channel to send the message to.
     * @param clientId - The clientId to send the message to, can be an array of clientIds
     * @param event - The event to send the message to
     * @param message - The message to send
     */
    send(channelName, clientId, event, message) {
        const clients = Array.isArray(clientId) ? clientId : [clientId];
        this._execute(channelName, channel => {
            channel.sendTo(event, message, enums_1.PondSenders.POND_CHANNEL, clients);
        });
    }
    /**
     * @desc Gets a list of all the channels in the endpoint.
     */
    get info() {
        return this._channels.map(channel => channel.info);
    }
    /**
     * @desc Searches for a channel in the endpoint.
     * @param query - The query to search for.
     */
    findChannel(query) {
        return this._channels.find(query)?.doc || null;
    }
    /**
     * @desc Subscribes a function to a channel in the endpoint.
     * @param channelName - The name of the channel to subscribe to.
     * @param callback - The function to subscribe to the channel.
     */
    subscribe(channelName, callback) {
        const channel = this._channels.query(c => c.name === channelName)[0];
        if (channel)
            return channel.doc.subscribe(callback);
        const newChannel = this._createChannel(channelName);
        return newChannel.subscribe(callback);
    }
    /**
     * @desc removes a user from all channels
     * @param clientId - The id of the client to remove
     */
    removeUser(clientId) {
        if (this._subscriptions[clientId]) {
            this._subscriptions[clientId].forEach(doc => doc.sub.unsubscribe());
            delete this._subscriptions[clientId];
            for (const channel of this._channels.generate())
                if (channel.hasUser(clientId))
                    channel.removeUser(clientId);
        }
    }
    /**
     * @desc Executes a function on a channel in the endpoint.
     * @param channelName - The name of the channel to execute the function on.
     * @param handler - The function to execute on the channel.
     * @private
     */
    _execute(channelName, handler) {
        const newChannel = this.findChannel(c => c.name === channelName) || null;
        if (newChannel)
            return handler(newChannel);
        throw new basePromise_1.PondError('Channel does not exist', 404, channelName);
    }
    /**
     * @desc Creates a new channel in the endpoint.
     * @param channelName - The name of the channel to create.
     * @private
     */
    _createChannel(channelName) {
        const newChannel = this._channels.createDocument(doc => {
            return new channel_1.Channel(channelName, doc.removeDoc.bind(doc));
        });
        this._subscribers.forEach(subscriber => {
            newChannel.doc.subscribe(subscriber);
        });
        return newChannel.doc;
    }
    /**
     * @desc Sends a message to a client
     * @param socket - The socket to send the message to
     * @param message - The message to send
     */
    static _sendMessage(socket, message) {
        socket.send(JSON.stringify(message));
    }
    /**
     * @desc Removes a subscription from a user
     * @param clientId - The id of the client to remove the subscription from
     * @param channelName - The name of the channel to remove the subscription from
     * @private
     */
    _removeSubscriptions(clientId, channelName) {
        const clients = Array.isArray(clientId) ? clientId : [clientId];
        clients.forEach(client => {
            const subs = this._subscriptions[client];
            if (subs) {
                const sub = subs.find(s => s.name === channelName);
                if (sub) {
                    sub.sub.unsubscribe();
                    subs.splice(subs.indexOf(sub), 1);
                }
            }
        });
    }
    /**
     * @desc Builds an event handler for a channel
     * @param event - The event to build the handler for
     * @param callback - The callback to build the handler for
     * @private
     */
    _buildHandler(event, callback) {
        return (data) => {
            let returnVal = undefined;
            const info = this.generateEventRequest(event, data.event);
            if (info) {
                const assigns = {
                    assigns: data.clientAssigns,
                    presence: data.clientPresence,
                    channelData: data.channel.data,
                };
                const request = {
                    channelName: data.channelName,
                    message: data.payload,
                    params: info.params,
                    query: info.query,
                    event: data.event,
                    client: {
                        clientId: data.clientId,
                        clientAssigns: data.clientAssigns,
                        clientPresence: data.clientPresence,
                    }
                };
                const resolver = (innerData) => {
                    const { presence, assigns, channelData } = innerData.assigns;
                    if (innerData.error)
                        returnVal = new basePromise_1.PondError(innerData.error.errorMessage, innerData.error.errorCode, {
                            event: data.event,
                            channelName: data.channelName,
                        });
                    else {
                        if (!this.isObjectEmpty(channelData))
                            data.channel.data = channelData;
                        if (!Object.values(enums_1.PondSenders).includes(data.clientId)) {
                            data.channel.updateUser(data.clientId, presence, assigns);
                            if (innerData.message)
                                data.channel.sendTo(innerData.message.event, innerData.message.payload, enums_1.PondSenders.POND_CHANNEL, [data.clientId]);
                        }
                    }
                };
                const response = new pondResponse_1.PondResponse(data.clientId, assigns, resolver);
                callback(request, response, data.channel);
            }
            return returnVal || !!info;
        };
    }
}
exports.PondChannel = PondChannel;
