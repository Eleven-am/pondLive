"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Endpoint = void 0;
const enums_1 = require("../enums");
const utils_1 = require("../utils");
const pondChannel_1 = require("./pondChannel");
class Endpoint extends utils_1.BaseClass {
    _handler;
    _server;
    _channels;
    _sockets;
    constructor(server, handler) {
        super();
        this._channels = new utils_1.PondBase();
        this._sockets = new utils_1.PondBase();
        this._handler = handler;
        this._server = server;
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
     * @desc Accepts a new socket join request to the room provided using the handler function to authorise the socket
     * @param path - the pattern to accept || can also be a regex
     * @param handler - the handler function to authenticate the socket
     *
     * @example
     * const channel = endpoint.createChannel('channel:*', (req, res) => {
     *   const isAdmin = req.clientAssigns.admin;
     *   if (!isAdmin)
     *      return res.reject('You are not an admin');
     *
     *   res.accept({
     *      assign: {
     *         admin: true,
     *         joinedDate: new Date()
     *      },
     *      presence: {state: 'online'},
     *      channelData: {private: true}
     *   });
     * });
     *
     * channel.on('ping', (req, res, channel) => {
     *     const users = channel.getPresence();
     *     res.assign({
     *        assign: {
     *           pingDate: new Date(),
     *           users: users.length
     *        }
     *    });
     * })
     */
    createChannel(path, handler) {
        const pondChannel = new pondChannel_1.PondChannel(path, handler);
        this._channels.set(pondChannel);
        return pondChannel;
    }
    /**
     * @desc Authenticates the client to the endpoint
     * @param request - Incoming request
     * @param socket - Incoming socket
     * @param head - Incoming head
     * @param data - Incoming the data resolved from the handler
     */
    authoriseConnection(request, socket, head, data) {
        return (0, utils_1.BasePromise)(socket, async (resolve, reject) => {
            const assign = {
                assigns: {},
                presence: {},
                channelData: {},
            };
            const doc = this._sockets.set({});
            const req = {
                headers: request.headers,
                ...data, clientId: doc.id,
            };
            const resolver = (data) => {
                if (data.error) {
                    doc.removeDoc();
                    return reject(data.error.errorMessage, data.error.errorCode);
                }
                this._server.handleUpgrade(request, socket, head, (ws) => {
                    this._server.emit('connection', ws);
                    let socketCache = {
                        socket: ws,
                        assigns: data.assigns.assigns,
                    };
                    doc.updateDoc(socketCache);
                    this._manageSocket(doc);
                    if (data.message) {
                        const newMessage = {
                            action: enums_1.ServerActions.MESSAGE,
                            event: data.message.event,
                            channelName: 'SERVER',
                            payload: data.message.payload,
                        };
                        Endpoint._sendMessage(ws, newMessage);
                    }
                    resolve();
                });
            };
            const res = new utils_1.PondResponse(socket, assign, resolver, false);
            await this._handler(req, res, this);
        });
    }
    /**
     * @desc Closes a client connection to the endpoint.
     * @param clientId - The id of the client to close the connection to.
     */
    closeConnection(clientId) {
        const message = {
            action: enums_1.ServerActions.CLOSE,
            channelName: 'SERVER',
            event: 'CLOSED_FROM_SERVER', payload: {},
        };
        const stringifiedMessage = JSON.stringify(message);
        const socketDoc = this._sockets.get(clientId);
        if (socketDoc) {
            socketDoc.doc.socket.send(stringifiedMessage);
            socketDoc.doc.socket.close();
            socketDoc.removeDoc();
        }
    }
    /**
     * @desc Sends a message to a client on the endpoint.
     * @param clientId - The id of the client to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    send(clientId, event, message) {
        const newMessage = {
            action: enums_1.ServerActions.MESSAGE,
            channelName: 'SERVER',
            event, payload: message,
        };
        const stringifiedMessage = JSON.stringify(newMessage);
        const addresses = Array.isArray(clientId) ? clientId : [clientId];
        this._sockets.queryByKeys(addresses)
            .forEach(client => client.doc.socket.send(stringifiedMessage));
    }
    /**
     * @desc lists all the channels in the endpoint
     */
    listChannels() {
        return this._channels.map(channel => channel.info).flat();
    }
    /**
     * @desc lists all the clients in the endpoint
     */
    listConnections() {
        return this._sockets.map(socket => socket.socket);
    }
    /**
     * @desc Broadcasts a message to all clients in the endpoint.
     * @param event - The event to broadcast.
     * @param message - The message to broadcast.
     */
    broadcast(event, message) {
        const sockets = [...this._sockets.generate()];
        const newMessage = {
            action: enums_1.ServerActions.MESSAGE, channelName: 'SERVER',
            event, payload: message,
        };
        const stringifiedMessage = JSON.stringify(newMessage);
        sockets.forEach(socket => socket.socket.send(stringifiedMessage));
    }
    /**
     * @desc Searches for a channel in the endpoint.
     * @param name - The name of the channel to search for.
     */
    _findChannel(name) {
        const pond = this._findPondChannel(name);
        if (pond) {
            const channel = pond.doc.findChannel(channel => channel.name === name);
            if (channel)
                return channel;
        }
        return undefined;
    }
    /**
     * @desc Manages a new socket connection
     * @param cache - The socket cache
     * @private
     */
    _manageSocket(cache) {
        const socket = cache.doc.socket;
        socket.addEventListener('message', (message) => this._readMessage(cache, message.data));
        socket.addEventListener('close', () => {
            for (const channel of this._channels.generate())
                channel.removeUser(cache.id);
            cache.removeDoc();
        });
        socket.addEventListener('error', () => {
            for (const channel of this._channels.generate())
                channel.removeUser(cache.id);
            cache.removeDoc();
        });
    }
    /**
     * @desc Finds a pond channel in the endpoint.
     * @param channelName - The name of the channel to find.
     * @private
     */
    _findPondChannel(channelName) {
        return this._channels.find(channel => this.generateEventRequest(channel.path, channelName) !== null);
    }
    /**
     * @desc Handles a message sent from a client
     * @param cache - The socket cache of the client
     * @param message - The message to handle
     * @private
     */
    async _readMessage(cache, message) {
        const errorMessage = {
            action: enums_1.ServerActions.ERROR,
            event: 'INVALID_MESSAGE',
            channelName: 'END_POINT',
            payload: {}
        };
        try {
            const data = JSON.parse(message);
            if (!data.action)
                errorMessage.payload = {
                    message: 'No action provided',
                };
            else if (!data.channelName)
                errorMessage.payload = {
                    message: 'No channel name provided',
                };
            else if (!data.payload)
                errorMessage.payload = {
                    message: 'No payload provided',
                };
            else
                await this._handleMessage(cache, data);
            if (!this.isObjectEmpty(errorMessage.payload))
                Endpoint._sendMessage(cache.doc.socket, errorMessage);
        }
        catch (e) {
            if (e instanceof SyntaxError) {
                const message = {
                    action: enums_1.ServerActions.ERROR,
                    event: 'INVALID_MESSAGE',
                    channelName: 'END_POINT',
                    payload: {
                        message: 'Invalid message',
                    }
                };
                Endpoint._sendMessage(cache.doc.socket, message);
            }
            else if (e instanceof utils_1.PondError) {
                const message = {
                    action: enums_1.ServerActions.ERROR,
                    event: e.data?.event || 'INVALID_MESSAGE',
                    channelName: e.data?.channelName || 'END_POINT',
                    payload: {
                        message: e.errorMessage,
                        code: e.errorCode,
                        data: e.data.event ? undefined : e.data
                    }
                };
                Endpoint._sendMessage(cache.doc.socket, message);
            }
        }
    }
    /**
     * @desc Deals with a message sent from a client
     * @param cache - The socket cache of the client
     * @param message - The message to handle
     */
    async _handleMessage(cache, message) {
        switch (message.action) {
            case 'JOIN_CHANNEL':
                const pond = this._findPondChannel(message.channelName);
                if (pond) {
                    const user = {
                        clientId: cache.id,
                        socket: cache.doc.socket,
                        assigns: cache.doc.assigns,
                    };
                    await pond.doc.addUser(user, message.channelName, message.payload);
                }
                else
                    throw new utils_1.PondError('The channel was not found', 4004, {
                        channelName: message.channelName,
                        event: 'JOIN_CHANNEL'
                    });
                break;
            case 'LEAVE_CHANNEL':
                await this._channelAction(message.channelName, 'LEAVE_CHANNEL', channel => {
                    channel.removeUser(cache.id);
                });
                break;
            case 'BROADCAST_FROM':
                await this._channelAction(message.channelName, message.event, async (channel) => {
                    await channel.broadcastFrom(message.event, message.payload, cache.id);
                });
                break;
            case 'BROADCAST':
                await this._channelAction(message.channelName, message.event, async (channel) => {
                    channel.broadcast(message.event, message.payload, cache.id);
                });
                break;
            case 'SEND_MESSAGE_TO_USER':
                await this._channelAction(message.channelName, message.event, async (channel) => {
                    if (!message.addresses || message.addresses.length === 0)
                        throw new utils_1.PondError('No addresses provided', 400, {
                            event: message.event,
                            channelName: message.channelName,
                        });
                    channel.sendTo(message.event, message.payload, cache.id, message.addresses);
                });
                break;
            case 'UPDATE_PRESENCE':
                await this._channelAction(message.channelName, 'UPDATE_PRESENCE', async (channel) => {
                    await channel.updateUser(cache.id, message.payload?.presence || {}, message.payload?.assigns || {});
                });
                break;
        }
    }
    /**
     * @desc Handles a channel action by finding the channel and executing the callback.
     * @param channelName - The name of the channel to find.
     * @param event - The event to execute.
     * @param action - The action to execute.
     * @private
     */
    _channelAction(channelName, event, action) {
        const channel = this._findChannel(channelName);
        if (!channel)
            throw new utils_1.PondError('Channel not found', 404, { channelName, event });
        return action(channel);
    }
}
exports.Endpoint = Endpoint;
