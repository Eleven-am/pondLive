import {WebSocket, WebSocketServer} from "ws";
import {BaseClass, BaseMap, BasePromise, PondError, RejectPromise} from "./utils";
import {IncomingMessage, Server} from "http";
import internal from "stream";
import {parse} from "url";
import {InternalPondChannel, PondEndpoint, ServerMessage} from "./channel";
import {Subject} from "rxjs";
import {filter} from 'rxjs/operators';
import {InternalPondPresence} from "../index";

type default_t = {
    [key: string]: any;
}

type PondAssigns = default_t;
type PondPresence = default_t;
type PondChannelData = default_t;

type ClientActions =
    'JOIN_CHANNEL'
    | 'LEAVE_CHANNEL'
    | 'UPDATE_PRESENCE'
    | 'BROADCAST_FROM'
    | 'BROADCAST'
    | 'SEND_MESSAGE_TO_USER';

type MessageType = 'BROADCAST' | 'BROADCAST_FROM' | 'SEND_MESSAGE_TO_USER';

type ClientMessage = {
    action: ClientActions;
    channelName: string;
    event: string;
    payload: default_t;
    addresses?: string[];
}

type ServerEmittedAction = 'ERROR' | 'MESSAGE' | 'JOINED' | 'LEFT' | 'PRESENCE' | 'ACTION';

type ServerEmittedMessage = {
    action: ServerEmittedAction;
    channelName: string;
    event: string;
    payload: default_t;
}

interface PondResponseAssigns {
    assign?: PondAssigns;
    presence?: PondPresence;
    channelData?: PondChannelData;
}

interface IncomingJoinMessage {
    clientId: string;
    channelId: string;
    channelName: string;
    clientAssigns: PondAssigns;
}

interface IncomingChannelMessage {
    event: string;
    channelId: string;
    channelName: string;
    message: default_t;
    client: {
        clientId: string;
        clientAssigns: PondAssigns;
        clientPresence: PondPresence;
    }
}

interface PondResponse {
    accept: (assigns?: PondResponseAssigns) => void;
    reject: (message?: string, statusCode?: number) => void;
}

export type PondPath = string | RegExp;

type SocketCache = {
    endpointId: string;
    socket: WebSocket;
    clientId: string;
    assigns: PondAssigns;
}

export type EndpointCache = {
    path: PondPath;
    channels: BaseMap<string, Channel>;
    subject: Subject<ServerMessage>;
    handler: (req: IncomingMessage, res: PondResponse) => void;
    socketCache: BaseMap<string, SocketCache>;
    authorizers: BaseMap<PondPath, {
        handler: (req: IncomingJoinMessage, res: PondResponse) => void
        events: BaseMap<string | RegExp, (req: IncomingChannelMessage, res: PondResponse, channel: InternalPondChannel) => void>;
    }>;
}

type NewUser = {
    clientId: string;
    assigns: PondAssigns;
    presence: PondPresence;
    channelData: PondChannelData;
}

export class Channel {
    public readonly channelId: string;
    public readonly channelName: string;
    private data: PondChannelData;
    private readonly base: BaseClass;
    private readonly subject: Subject<ServerMessage>;
    private readonly assigns: BaseMap<string, PondAssigns>;
    private readonly presence: BaseMap<string, PondPresence>;
    private verifiers: BaseMap<PondPath, (req: IncomingChannelMessage, res: PondResponse, channel: InternalPondChannel) => void>;

    constructor(channelName: string, subject: Subject<ServerMessage>, verifiers: BaseMap<PondPath, (req: IncomingChannelMessage, res: PondResponse, channel: InternalPondChannel) => void>) {
        this.channelName = channelName;
        this.base = new BaseClass();
        this.subject = subject;
        this.channelId = this.base.uuid();
        this.verifiers = verifiers;
        this.data = {};
        this.presence = new BaseMap();
        this.assigns = new BaseMap();
        this.listenToClientDisconnected();
    }

    /**
     * @desc Adds a new user to the channel
     * @param user - The user to add to the channel
     */
    public set newUser(user: NewUser) {
        this.presence.set(user.clientId, user.presence);
        this.assigns.set(user.clientId, user.assigns);
        this.data = {...this.data, ...user.channelData};

        const message: ServerMessage = {
            action: 'PRESENCE_BRIEF',
            event: 'join', clientId: user.clientId,
            channelName: this.channelName,
            addresses: this.clientIds,
            payload: {
                presence: this.presenceList,
                joined: user.presence
            }
        }

        this.sendToClients(message);
    }

    /**
     * @desc Gets the list of presence in the channel
     */
    public get presenceList(): InternalPondPresence[] {
        return this.presence.toArray();
    }

    /**
     * @desc Gets the data of the channel
     */
    public get channelData(): PondChannelData {
        return this.data;
    }

    /**
     * @desc Gets the list of users in the channel
     * @private
     */
    public get clientIds() {
        return Array.from(this.presence.keys());
    }

    /**
     * @desc Sends a message to the clients addressed in the channel
     * @param message - The message to send
     */
    public sendToClients(message: ServerMessage) {
        this.subject.next(message);
    }

    /**
     * @desc Removes a user from the channel
     * @param clientId - The clientId of the user to remove
     */
    public removeUser(clientId: string) {
        const client = this.getUser(clientId);

        if (!client) {
            const error = new PondError(`Client ${clientId} does not exist in channel ${this.channelName}`, 301, clientId);
            return this.sendError(error);
        }

        this.presence.deleteKey(clientId);
        this.assigns.deleteKey(clientId);

        if (this.clientIds.length === 0) {
            const message: ServerMessage = {
                action: 'CHANNEL_DESTROY',
                channelName: this.channelName,
                addresses: [], payload: {},
                clientId: this.channelId, event: 'destroy'
            }

            this.subject.next(message);
        } else {
            const message: ServerMessage = {
                action: 'PRESENCE_BRIEF',
                event: 'leave', clientId: clientId,
                channelName: this.channelName,
                addresses: this.clientIds,
                payload: {
                    presence: this.presenceList,
                    left: client.clientPresence
                },
            }

            this.sendToClients(message);
        }
    }

    /**
     * @desc Updates the state of a user in the channel
     * @param clientId - The clientId of the user to update
     * @param presence - The new presence of the user
     * @param assigns - The new assigns of the user
     */
    public updateUser(clientId: string, presence: PondPresence, assigns: PondAssigns) {
        const client = this.getUser(clientId);
        if (!client) {
            const error = new PondError(`Client ${clientId} does not exist in channel ${this.channelName}`, 301, clientId);
            return this.sendError(error);
        }

        const internalAssign = {...client.clientAssigns, ...assigns};
        const internalPresence = {...client.clientPresence, ...presence};

        this.presence.set(clientId, internalPresence);
        this.assigns.set(clientId, internalAssign);

        const message: ServerMessage = {
            action: 'PRESENCE_BRIEF',
            event: 'update', clientId: clientId,
            channelName: this.channelName,
            addresses: this.clientIds,
            payload: {
                presence: this.presenceList,
                updated: internalPresence
            }
        }

        this.sendToClients(message);
    }

    /**
     * @desc Authorises the message before sending it through the channel
     * @param event - The event to authorise
     * @param message - The message to authorise\
     * @param clientId - The clientId of the user sending the message
     * @param type - The type of message to authorise
     * @param addresses - The addresses of the message
     */
    public authorise(event: string, message: default_t, clientId: string, type: MessageType, addresses?: string[]) {
        return BasePromise<void, string>((resolve, reject) => {
            const client = this.getUser(clientId);
            if (!client)
                return reject("Client not found", 404, clientId);

            const request: IncomingChannelMessage = {
                event, channelId: this.channelId,
                channelName: this.channelName,
                message, client: client,
            }

            let newAddresses: string[] = [];

            switch (type) {
                case 'BROADCAST_FROM':
                    newAddresses = this.clientIds.filter(e => e !== clientId);
                    break;

                case 'BROADCAST':
                    newAddresses = this.clientIds;
                    break;

                case 'SEND_MESSAGE_TO_USER':
                    newAddresses = addresses ? addresses : [];
                    break;
            }

            const newMessage: ServerMessage = {
                action: 'MESSAGE', payload: message,
                event: event, clientId: clientId,
                channelName: this.channelName,
                addresses: newAddresses
            }

            const response = this.base.generatePondResponse((assigns: PondResponseAssigns) => {
                if (assigns) {
                    if (assigns.channelData)
                        this.data = {...this.data, ...assigns.channelData};

                    if (!this.base.isObjectEmpty(assigns.presence!) || !this.base.isObjectEmpty(assigns.assign!))
                        this.updateUser(clientId, assigns.presence!, assigns.assign!);
                }

                this.sendToClients(newMessage);
                resolve();
            }, reject, clientId);

            const newChannel = new InternalPondChannel(this);

            const verifier = this.verifiers.findByKey(e => this.base.compareStringToPattern(event, e))?.value;

            if (!verifier) {
                this.sendToClients(newMessage);
                return resolve();
            }

            verifier(request, response, newChannel);
        }, clientId);
    }

    /**
     * @desc Sends an error to the client
     * @param error - The error to send
     */
    public sendError(error: RejectPromise<string>) {
        const message: ServerMessage = {
            action: 'CHANNEL_ERROR',
            event: 'error', clientId: this.channelId,
            channelName: this.channelName,
            addresses: [error.data],
            payload: {
                error: error.errorMessage,
                code: error.errorCode,
            },
        }

        this.sendToClients(message);
    }

    /**
     * @desc Gets a user's data from the channel
     * @param clientId - The clientId of the user to get data for
     * @private
     */
    private getUser(clientId: string) {
        if (!this.presence.has(clientId) || !this.assigns.has(clientId))
            return null;

        return {
            clientId: clientId,
            clientAssigns: this.assigns.get(clientId)!,
            clientPresence: this.presence.get(clientId)!,
        }
    }

    /**
     * @desc Listens to the client disconnected Message
     */
    private listenToClientDisconnected() {
        this.subject
            .subscribe(message => {
                if (message.action === 'CLIENT_DISCONNECTED')
                    this.removeUser(message.clientId);
            });
    }
}

export class PondSocket {
    private readonly base: BaseClass;
    private readonly server: Server;
    private readonly socketServer: WebSocketServer;
    private readonly endpoints: BaseMap<string, EndpointCache> = new BaseMap();

    constructor(server?: Server, socketServer?: WebSocketServer) {
        this.base = new BaseClass();
        this.server = server || new Server();
        this.socketServer = socketServer || new WebSocketServer({noServer: true});
        this.init();
    }

    /**
     * @desc Rejects the client's connection
     * @param error - Reason for rejection
     */
    private static rejectClient(error: RejectPromise<internal.Duplex>) {
        const {errorMessage, errorCode, data: socket} = error;
        socket.write(`HTTP/1.1 ${errorCode} ${errorMessage}\r\n\r\n`);
        socket.destroy();
    }

    /**
     * @desc Sends a message to a client
     * @param socket - The socket to send the message to
     * @param message - The message to send
     */
    private static sendMessage(socket: WebSocket, message: ServerEmittedMessage) {
        socket.send(JSON.stringify(message));
    }

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
    public createEndpoint(path: PondPath, handler: (req: IncomingMessage, res: PondResponse) => void) {
        const endpointId = this.base.uuid();
        const endpoint: EndpointCache = {
            path, handler,
            authorizers: new BaseMap(),
            socketCache: new BaseMap(),
            channels: new BaseMap(),
            subject: new Subject(),
        }
        this.endpoints.set(endpointId, endpoint);
        return new PondEndpoint(endpoint);
    }

    /**
     * @desc Specifies the port to listen on
     * @param port - the port to listen on
     * @param callback - the callback to call when the server is listening
     */
    public listen(port: number, callback: (port?: number) => void) {
        return this.server.listen(port, callback);
    }

    /**
     * @desc Gets a channel and performs an action on it
     * @param endpointId - The id of the endpoint the channel is on
     * @param channelName - The id of the channel to perform the action on
     * @param action - The action to perform on the channel
     * @private
     */
    private async channelAction(endpointId: string, channelName: string, action: (channel: Channel) => void | Promise<void>) {
        const endpoint = this.endpoints.get(endpointId);

        if (!endpoint)
            throw new PondError('No endpoint found', 404, {channelName});

        const channel = endpoint.channels.find(channel => channel.channelName === channelName);

        if (!channel)
            throw new PondError('No channel found', 404, {channelName});

        await action(channel.value);
    }

    /**
     * @desc Makes sure that every client is still connected to the pond
     * @param server - WebSocket server
     */
    private pingClients(server: WebSocketServer) {
        server.on('connection', (ws: WebSocket & { isAlive?: boolean }) => {
            ws.isAlive = true;
            ws.on('pong', () => {
                ws.isAlive = true;
            });
        });

        const interval = setInterval(() => {
            server.clients.forEach((ws: WebSocket & { isAlive?: boolean }) => {
                if (ws.isAlive === false) return ws.terminate();
                ws.isAlive = false;
                ws.ping();
            })
        }, 30000);

        server.on('close', () => clearInterval(interval))
    }

    /**
     * @desc Initializes the server
     */
    private init() {
        this.server.on('upgrade', (request, socket, head) => {
            this.authenticateClient(request, socket, head)
                .then(socket => this.addSocketListeners(socket))
                .catch(error => PondSocket.rejectClient(error));
        });

        this.server.on('error', (error) => {
            throw new PondError('Server error', 500, {error});
        });

        this.server.on('listening', () => {
            this.pingClients(this.socketServer);
        });
    }

    /**
     * @desc Leaves a channel
     * @param endpointId - The endpointId of the endpoint to leave
     * @param clientId - The clientId of the client to leave
     * @param channelName - The name of the channel to leave
     */
    private async leaveChannel(endpointId: string, clientId: string, channelName: string) {
        await this.channelAction(endpointId, channelName, channel => channel.removeUser(clientId));
    }

    /**
     * @desc Authenticates the client by checking if there is a matching endpoint
     * @param request - Incoming request
     * @param socket - Incoming socket
     * @param head - Incoming head
     */
    private authenticateClient(request: IncomingMessage, socket: internal.Duplex, head: Buffer) {
        return BasePromise<SocketCache, internal.Duplex>((resolve, reject) => {
            const {pathname} = parse(request.url || '');

            if (!pathname)
                return reject('No pathname found', 404, socket);

            const endpoint = this.endpoints.find(endpoint => this.base.compareStringToPattern(pathname, endpoint.path));

            if (!endpoint)
                return reject('No endpoint found', 404, socket);

            const response = this.base.generatePondResponse((assigns: PondResponseAssigns) => {
                const clientId = this.base.uuid();
                const intAssigns = assigns.assign || {};

                this.socketServer.handleUpgrade(request, socket, head, (ws) => {
                    const socketCache: SocketCache = {
                        clientId, assigns: intAssigns,
                        socket: ws, endpointId: endpoint.key,
                    }
                    this.socketServer.emit('connection', ws);
                    endpoint.value.socketCache.set(clientId, socketCache);
                    resolve(socketCache);
                });

            }, reject, socket);

            endpoint.value.handler(request, response);
        }, socket);
    }

    /**
     * @desc Receives as socketCache and adds listeners to it
     * @param cache - Socket cache to add listeners to
     */
    private addSocketListeners(cache: SocketCache) {
        const endpoint = this.endpoints.get(cache.endpointId);

        if (!endpoint)
            throw new PondError('No endpoint found', 404, {clientId: cache.clientId});

        const subscription = endpoint.subject.pipe(
            filter(message => message.addresses.includes(cache.clientId)),
        ).subscribe(message => PondSocket.handleServerMessage(cache.socket, message));

        cache.socket.addEventListener('message', (message) => this.readMessage(cache, message.data as string));

        cache.socket.addEventListener('close', () => {
            const message: ServerMessage = {
                action: 'CLIENT_DISCONNECTED',
                clientId: cache.clientId,
                addresses: [], event: 'close',
                channelName: 'END_POINT', payload: {},
            }

            endpoint.subject.next(message);
            endpoint.socketCache.deleteKey(cache.clientId);
            subscription.unsubscribe();
        });

        cache.socket.addEventListener('error', () => {
            const message: ServerMessage = {
                action: 'CLIENT_DISCONNECTED',
                clientId: cache.clientId,
                addresses: [], event: 'close',
                channelName: 'END_POINT', payload: {},
            }

            endpoint.subject.next(message);
            endpoint.socketCache.deleteKey(cache.clientId);
            subscription.unsubscribe();
        });
    }

    /**
     * @desc Authorises the client to join a channel
     * @param clientId - The id of the client making the request
     * @param channelName - The name of the channel the client wishes to join
     * @param endpointId - The id of the endpoint the client is connected to
     */
    private authoriseClient(clientId: string, channelName: string, endpointId: string) {
        return BasePromise<void, { channelName: string, clientId: string }>((resolve, reject) => {
            const endpoint = this.endpoints.get(endpointId);

            if (!endpoint)
                return reject('No endpoint found', 404, {channelName, clientId});

            const authorizer = endpoint.authorizers.findByKey(authorizer => this.base.compareStringToPattern(channelName, authorizer))?.value;

            if (!authorizer)
                return reject('No authorizer found', 404, {channelName, clientId});

            const socketCache = endpoint.socketCache.get(clientId) as SocketCache;

            let channelId;
            let channel: Channel;
            const presentChannel = endpoint.channels.find(channel => channel.channelName === channelName);
            if (presentChannel) {
                channelId = presentChannel.key;
                channel = presentChannel.value;
            } else {
                channel = new Channel(channelName, endpoint.subject, authorizer.events);
                channelId = channel.channelId;

                endpoint.channels.set(channelId, channel);
            }

            const request: IncomingJoinMessage = {
                clientId, channelName, channelId,
                clientAssigns: socketCache.assigns,
            }

            const response = this.base.generatePondResponse((assigns: PondResponseAssigns) => {
                const intAssigns = {...socketCache.assigns, ...assigns.assign};
                const intPresence = {...assigns.presence};

                channel.newUser = {
                    presence: intPresence,
                    clientId, assigns: intAssigns,
                    channelData: assigns.channelData || {}
                }
                return resolve();

            }, reject, {channelName, clientId});
            authorizer.handler(request, response);
        }, {channelName, clientId});
    }

    /**
     * @desc Handles a message sent from a client
     * @param cache - The socket cache of the client
     * @param message - The message to handle
     * @private
     */
    private async readMessage(cache: SocketCache, message: string) {
        const errorMessage: ServerEmittedMessage = {
            action: 'ERROR',
            event: 'INVALID_MESSAGE',
            channelName: 'END_POINT',
            payload: {}
        }

        try {
            const data = JSON.parse(message) as ClientMessage;

            if (!data.action)
                errorMessage.payload = {
                    message: 'No action provided',
                }

            else if (!data.channelName)
                errorMessage.payload = {
                    message: 'No channelName provided',
                }

            else if (!data.payload)
                errorMessage.payload = {
                    message: 'No payload provided',
                }

            else
                await this.handleMessage(cache, data);

            if (!this.base.isObjectEmpty(errorMessage.payload))
                PondSocket.sendMessage(cache.socket, errorMessage);

        } catch (e: any) {
            if (e instanceof SyntaxError) {
                const message: ServerEmittedMessage = {
                    action: 'ERROR',
                    event: 'INVALID_MESSAGE',
                    channelName: 'END_POINT',
                    payload: {
                        message: e.message
                    }
                }
                PondSocket.sendMessage(cache.socket, message);
            } else if (e instanceof PondError) {
                const message: ServerEmittedMessage = {
                    action: 'ERROR',
                    event: 'INVALID_MESSAGE',
                    channelName: 'END_POINT',
                    payload: {
                        message: e.errorMessage,
                        code: e.errorCode,
                        data: e.data
                    }
                }

                PondSocket.sendMessage(cache.socket, message);
            }
        }
    }

    /**
     * @desc Deals with a message sent from a client
     * @param cache - The socket cache of the client
     * @param message - The message to handle
     */
    private async handleMessage(cache: SocketCache, message: ClientMessage) {
        switch (message.action) {
            case 'JOIN_CHANNEL':
                await this.authoriseClient(cache.clientId, message.channelName, cache.endpointId);
                break;

            case 'LEAVE_CHANNEL':
                await this.leaveChannel(cache.endpointId, cache.clientId, message.channelName);
                break;

            case 'BROADCAST_FROM':
                await this.channelAction(cache.endpointId, message.channelName, async (channel) => {
                    await channel.authorise(message.event, message.payload, cache.clientId, 'BROADCAST_FROM');
                });
                break;

            case 'BROADCAST':
                await this.channelAction(cache.endpointId, message.channelName, async (channel) => {
                    await channel.authorise(message.event, message.payload, cache.clientId, 'BROADCAST');
                });
                break;

            case 'SEND_MESSAGE_TO_USER':
                await this.channelAction(cache.endpointId, message.channelName, async (channel) => {
                    await channel.authorise(message.event, message.payload, cache.clientId, 'SEND_MESSAGE_TO_USER', message.addresses);
                });
                break;

            case 'UPDATE_PRESENCE':
                await this.channelAction(cache.endpointId, message.channelName, async (channel) => {
                    await channel.updateUser(cache.clientId, message.payload?.presence, message.payload?.assigns);
                });
                break;
        }

    }

    /**
     * @desc Handles a message sent by the server and sends it to the client
     * @param socket - The socket to send the message to
     * @param message - The message to send
     * @private
     */
    private static handleServerMessage(socket: WebSocket, message: ServerMessage) {
        let newMessage: ServerEmittedMessage;

        switch (message.action) {
            case 'PRESENCE_BRIEF':
                newMessage = {
                    action: 'PRESENCE',
                    event: 'PRESENCE_BRIEF',
                    channelName: message.channelName,
                    payload: message.payload
                }
                break;

            case 'MESSAGE':
                newMessage = {
                    action: 'MESSAGE',
                    event: message.event,
                    channelName: message.channelName,
                    payload: message.payload
                }
                break;

            case 'KICKED_FROM_CHANNEL':
                newMessage = {
                    action: 'ACTION',
                    event: 'KICKED_FROM_CHANNEL',
                    channelName: message.channelName,
                    payload: message.payload
                }
                break;

            case 'CLIENT_DISCONNECTED':

            case 'CLOSED_FROM_SERVER':
                newMessage = {
                    action: 'ACTION',
                    event: 'CLOSED_FROM_SERVER',
                    channelName: message.channelName,
                    payload: message.payload
                }
                break;

            case 'CHANNEL_DESTROY':
                newMessage = {
                    action: 'ACTION',
                    event: 'CHANNEL_DESTROYED',
                    channelName: message.channelName,
                    payload: message.payload
                }
                break;

            case 'CHANNEL_ERROR':
                newMessage = {
                    action: 'ERROR',
                    event: 'CHANNEL_ERROR',
                    channelName: message.channelName,
                    payload: message.payload
                }
                break;
        }

        PondSocket.sendMessage(socket, newMessage);
        if (message.action === 'CLOSED_FROM_SERVER')
            socket.close();
    }
}
