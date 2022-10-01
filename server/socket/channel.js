"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = void 0;
const utils_1 = require("../utils");
const enums_1 = require("../enums");
class Channel extends utils_1.BaseClass {
    name;
    _broadcast;
    _messages;
    _channelAssigns;
    _channelPresence;
    removeChannel;
    _channelData;
    constructor(name, removeChannel) {
        super();
        this.name = name;
        this._channelPresence = new utils_1.PondBase();
        this._channelAssigns = {};
        this._channelData = {};
        this._broadcast = new utils_1.Broadcast();
        this.removeChannel = removeChannel;
        this._messages = new utils_1.Broadcast();
    }
    /**
     * @desc Returns the channel info
     */
    get info() {
        return {
            name: this.name, channelData: this.data, presence: this.presence, assigns: this.assigns
        };
    }
    /**
     * @desc Gets the channel's data
     */
    get data() {
        return this._channelData;
    }
    /**
     * @desc Sets the channel's data
     * @param data
     */
    set data(data) {
        this._channelData = { ...this._channelData, ...data };
    }
    /**
     * @desc Gets the channel's presence
     */
    get presence() {
        return this._channelPresence.toArray()
            .map(presence => presence.doc);
    }
    /**
     * @desc Gets the channel's assigns
     */
    get assigns() {
        const assigns = {};
        Object.keys(this._channelAssigns).forEach(clientId => {
            const { presenceId, ...rest } = this._channelAssigns[clientId];
            assigns[clientId] = rest;
        });
        return assigns;
    }
    /**
     * @desc Checks if a user exists in the channel
     * @param clientId - The clientId of the user
     */
    hasUser(clientId) {
        return !!this._channelAssigns[clientId];
    }
    /**
     * @desc Adds a new user to the channel
     * @param user - The user to add to the channel
     */
    addUser(user) {
        const clientId = user.client.clientId;
        if (this.hasUser(clientId)) {
            throw new utils_1.PondError('User already exists in channel', 5001, clientId);
        }
        const doc = this._channelPresence.set({ ...user.presence, id: clientId });
        this._channelAssigns[clientId] = { ...user.assigns, presenceId: doc.id };
        this._channelData = { ...this._channelData, ...user.channelData };
        this._broadcast.publish({
            event: 'JOIN_CHANNEL',
            channelName: this.name,
            action: enums_1.ServerActions.PRESENCE,
            payload: {
                presence: this.presence, change: { ...user.presence, id: clientId }
            },
            channel: this, clientId: enums_1.PondSenders.POND_CHANNEL,
            clientAssigns: user.assigns, clientPresence: { ...user.presence, id: clientId }
        });
    }
    /**
     * @desc Gets a user's information
     * @param clientId - The clientId of the user
     */
    getUserInfo(clientId) {
        const client = this._retrieveUser(clientId);
        if (!client)
            return null;
        return {
            presence: client.presence.doc, assigns: client.assigns
        };
    }
    /**
     * @desc Removes a user or group of users from the channel
     * @param clientIds - The clientIds of the users to remove
     */
    removeUser(clientIds) {
        const clients = Array.isArray(clientIds) ? clientIds : [clientIds];
        clients.forEach(clientId => {
            const client = this._retrieveUser(clientId);
            if (client) {
                client.presence.removeDoc();
                delete this._channelAssigns[clientId];
                this._broadcast.publish({
                    event: 'LEAVE_CHANNEL',
                    channelName: this.name,
                    action: enums_1.ServerActions.PRESENCE,
                    payload: {
                        presence: this.presence, change: null,
                    },
                    channel: this, clientId: enums_1.PondSenders.POND_CHANNEL,
                    clientAssigns: client.assigns, clientPresence: client.presence.doc
                });
            }
        });
        if (this._channelPresence.size === 0) {
            this._broadcast.publish({
                event: 'REMOVE_CHANNEL',
                channelName: this.name,
                action: enums_1.ServerActions.CLOSE,
                payload: {}, channel: this,
                clientId: enums_1.PondSenders.POND_CHANNEL,
                clientAssigns: {}, clientPresence: {}
            });
            this.removeChannel();
        }
    }
    /**
     * @desc Broadcasts a message to all users in the channel
     * @param event - The event name
     * @param message - The message to send
     * @param sender - The sender of the message
     */
    broadcast(event, message, sender = enums_1.PondSenders.POND_CHANNEL) {
        const client = this._retrieveUser(sender);
        if (!client && !Object.values(enums_1.PondSenders).includes(sender))
            throw new utils_1.PondError('Client not found', 5002, sender);
        const newMessage = {
            action: enums_1.ServerActions.MESSAGE, payload: message, event: event, channelName: this.name,
        };
        const value = this._broadcast.publish({
            ...newMessage,
            channel: this,
            clientId: sender,
            clientAssigns: client ? client.assigns : {},
            clientPresence: client ? client.presence.doc : {}
        });
        if (value instanceof utils_1.PondError)
            throw value;
        this._sendToClients(Object.keys(this._channelAssigns), newMessage);
    }
    /**
     * @desc Broadcasts a message to all users in the channel except the sender
     * @param event - The event name
     * @param message - The message to send
     * @param clientId - The client id of the sender
     */
    broadcastFrom(event, message, clientId) {
        const client = this._retrieveUser(clientId);
        if (!client)
            throw new utils_1.PondError('Client not found', 5002, clientId);
        const newMessage = {
            action: enums_1.ServerActions.MESSAGE, payload: message, event: event, channelName: this.name,
        };
        const value = this._broadcast.publish({
            ...newMessage,
            channel: this,
            clientId: clientId,
            clientAssigns: client.assigns,
            clientPresence: client.presence.doc
        });
        if (value instanceof utils_1.PondError)
            throw value;
        const clientIds = Object.keys(this._channelAssigns)
            .filter(id => id !== clientId);
        this._sendToClients(clientIds, newMessage);
    }
    /**
     * @desc Sends a message to a specific user or group of users
     * @param event - The event name
     * @param clientId - The client id of the user to send the message to
     * @param message - The message to send
     * @param sender - The client id of the sender
     */
    sendTo(event, message, sender, clientId) {
        const client = this._retrieveUser(sender);
        if (!client && !Object.values(enums_1.PondSenders).includes(sender))
            throw new utils_1.PondError('Client not found', 5002, sender);
        const clientIds = Array.isArray(clientId) ? clientId : [clientId];
        const notFound = clientIds.filter(id => !this._channelAssigns[id]);
        if (notFound.length > 0)
            throw new utils_1.PondError('Recipient not found', 5002, notFound);
        const newMessage = {
            action: enums_1.ServerActions.MESSAGE, payload: message, event: event, channelName: this.name,
        };
        const value = this._broadcast.publish({
            ...newMessage,
            channel: this,
            clientId: sender,
            clientAssigns: client?.assigns || {},
            clientPresence: client?.presence.doc || {}
        });
        if (value instanceof utils_1.PondError)
            throw value;
        this._sendToClients(clientIds, newMessage);
    }
    /**
     * @desc Subscribes to a channel event
     */
    subscribe(callback) {
        return this._broadcast.subscribe(callback);
    }
    /**
     * @desc Updates the state of a user in the channel
     * @param clientId - The clientId of the user to update
     * @param presence - The new presence of the user
     * @param assigns - The new assigns of the user
     */
    updateUser(clientId, presence, assigns) {
        const client = this._retrieveUser(clientId);
        if (client) {
            this._channelAssigns[clientId] = {
                ...client.assigns, ...assigns,
                presenceId: client.presence.id
            };
            const presenceDoc = { ...client.presence.doc, ...presence, id: clientId };
            if (!this.areEqual(presenceDoc, client.presence.doc)) {
                client.presence.updateDoc(presenceDoc);
                this._broadcast.publish({
                    event: 'UPDATE_CHANNEL',
                    channelName: this.name,
                    action: enums_1.ServerActions.PRESENCE,
                    payload: {
                        presence: this.presence, change: { clientId, presence, assigns },
                    },
                    channel: this,
                    clientId: enums_1.PondSenders.POND_CHANNEL,
                    clientAssigns: { ...client.assigns, ...assigns },
                    clientPresence: { ...presenceDoc }
                });
            }
        }
    }
    /**
     * @desc Subscribes to a channel event
     * @param clientId - The client id of the user to send the message to
     * @param callback - The callback to call when a message is received
     */
    subscribeToMessages(clientId, callback) {
        const sub1 = this._messages.subscribe(({ clients, message }) => {
            if (clients.includes(clientId))
                callback(message);
        });
        const sub2 = this._channelPresence.subscribe((docs, change, action) => {
            const message = {
                action: enums_1.ServerActions.PRESENCE,
                payload: { presence: docs, change },
                event: action,
                channelName: this.name,
            };
            callback(message);
        });
        return {
            unsubscribe: () => {
                sub1.unsubscribe();
                sub2.unsubscribe();
            }
        };
    }
    /**
       * @desc Sends a message to a specific user or group of users except the sender
       * @param clients - The client id of the user to send the message to
       * @param message - The message to send
       * @private
       */
    _sendToClients(clients, message) {
        this._messages.publish({ clients, message });
    }
    /**
     * @desc Retrieves a user from the channel
     * @param clientId - The client id of the user to retrieve
     * @private
     */
    _retrieveUser(clientId) {
        const user = this._channelAssigns[clientId];
        const presence = this._channelPresence.get(user?.presenceId || '');
        if (user && presence !== null) {
            const { presenceId, ...assigns } = user;
            return {
                assigns: assigns, presence: presence,
            };
        }
        return null;
    }
}
exports.Channel = Channel;
