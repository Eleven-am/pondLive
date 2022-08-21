import {createServer, IncomingMessage, Server} from 'http';
import {WebSocket, WebSocketServer} from 'ws';
import {assign, createMachine, interpret, Interpreter} from "xstate";
import {
    Channel,
    ChannelMessageEventVerifiers, DefaultServerErrorResponse,
    OutBoundChannelEvent,
    Presence,
    SocketClientMessageType, SocketJoinRoomResponse
} from "./channels";
import {BaseClass, BasePromise, RejectPromise} from "./base";
import internal from "stream";
import {parse} from "url";

export type default_t<T = any> = {
    [p: string]: T;
}

interface GlobalSocketContext {
    channels: Map<string, Channel>;
    sockets: Map<WebSocket, default_t>;
}

type SendErrorMessage = {
    type: 'error.platform.globalSockets.lobby:invocation[0]';
    data: RejectPromise<{
        room: string;
        socket: WebSocket;
    }>;
}

export type JoinRoomPromise = {
    roomName: string;
    clientId: string;
    roomData: default_t;
    assigns: default_t;
    presence: default_t;
    socket: WebSocket;
    endpoint: string;
    verifiers: ChannelMessageEventVerifiers;
}

type SocketJoinRoom = {
    type: 'done.invoke.globalSockets.lobby:invocation[0]'
    data: JoinRoomPromise;
}

type AddSocketPromise = {
    clientId: string;
    socket: WebSocket;
    assigns: default_t;
}

type AddSocketToDB = {
    type: 'done.invoke.globalSockets.authoriser:invocation[0]';
    data: AddSocketPromise;
}

type RejectSocketConnection = {
    type: 'error.platform.globalSockets.authoriser:invocation[0]';
    data: RejectPromise<internal.Duplex>;
}

type TerminateServer = {
    type: 'shutdown' | 'error' | 'error.platform.globalSockets.idle:invocation[0]';
    data: unknown
}

type IncomingRequest = {
    type: 'newUpgradeRequest',
    request: IncomingMessage;
    socket: internal.Duplex;
    head: Buffer;
}

type AuthenticateRoom = {
    type: 'requestToJoinRoom',
    clientId: string;
    socket: WebSocket;
    endpoint: string;
    assigns: default_t;
    roomToJoin: string;
    roomData: default_t;
}

type GlobalSocketEvent =
    AuthenticateRoom
    | SendErrorMessage
    | SocketJoinRoom
    | AddSocketToDB
    | RejectSocketConnection
    | TerminateServer
    | IncomingRequest;

export type GlobalSocketService = {
    authenticateRoom: {
        data: JoinRoomPromise;
    };
    setupServer: {
        data: void;
    };
    authenticateSocket: {
        data: AddSocketPromise;
    };
}

type JoinRoomAssigns = { assigns?: default_t, roomData?: default_t, presence?: default_t }

type GlobalAssigns = default_t;

type IncomingJoinRoomRequest = Omit<AuthenticateRoom, 'type'>;

export type NewIncomingRequest<T, V = default_t> = {
    request: T;
    accept: (assigns?: V) => void;
    decline: (message: string) => void;
}

type FunctionBank<T, V = any> = {
    pattern: string | RegExp;
    handler: (request: NewIncomingRequest<T, V>) => void;
}

type Endpoint = FunctionBank<IncomingMessage> & {
    rooms: (FunctionBank<IncomingJoinRoomRequest, JoinRoomAssigns> & {
        events: ChannelMessageEventVerifiers;
    })[];
}

export interface PonEndpoint {
    /**
     * @desc Accepts a new socket join request to the room provided using the handler function to authorise the socket
     * @param pattern - the pattern to accept || can also be a regex
     * @param handler - the handler function to authenticate the socket
     *
     * @example
     * const room = endpoint.createRoom('room:*', ({request, accept, decline}) => {
     *   const isAdmin = request.assigns.admin;
     *   if (!isAdmin)
     *      return decline('You are not an admin');
     *
     *   accept({assigns: {admin: true, joinedDate: new Date()}, presence: {state: online}, roomData: {private: true}});
     * });
     *
     * room.on('ping', ({assigns, roomData, assign}) => {
     *     assign({
     *        presence: {state: online},
     *        assigns: {lastPing: new Date()}
     *     });
     * })
     */
    createRoom: (pattern: string | RegExp, handler: ((request: NewIncomingRequest<IncomingJoinRoomRequest, JoinRoomAssigns>) => void)) => PondChannel;
}

export interface PondChannel {
    /**
     * @desc Adds an event listener to the channel
     * @param event - the event to listen for
     * @param callback - the callback to call when the event is triggered
     */
    on: (event: string, callback: (outBound: OutBoundChannelEvent) => void) => void;

    /**
     * @desc Broadcasts an event to all clients in the room
     * @param roomName - the name of the room to broadcast to
     * @param event - the event to broadcast
     * @param data - the data to broadcast
     */
    broadcast: (roomName: string, event: string, data: default_t) => void;

    /**
     * @desc Broadcasts an event to all clients in the room except the clientId provided
     * @param roomName - the name of the room to broadcast to
     * @param clientId - the clientId to exclude from the broadcast
     * @param event - the event to broadcast
     * @param data - the data to broadcast
     */
    broadcastFrom: (roomName: string, clientId: string, event: string, data: default_t) => void;

    /**
     * @desc Sends an event to the clientId provided
     * @param roomName - the name of the room to broadcast to
     * @param clientId - the clientId to send the event to
     * @param event - the event to broadcast
     * @param data - the data to broadcast
     */
    send: (roomName: string, clientId: string, event: string, data: default_t) => void;

    /**
     * @desc Gets the list of clients in the channel
     * @param roomName - the name of the room to get the clients from
     */
    getPresenceList: <T>(roomName: string) => Presence<T>[];

    /**
     * @desc Gets the metadata of the channel
     * @param roomName
     */
    getRoomData: (roomName: string) => default_t;

    /**
     * @desc Disconnects the client from the channel
     * @param roomName - the name of the room to disconnect from
     * @param clientId - the clientId to disconnect
     */
    disconnect: (roomName: string, clientId: string) => void;
}

export class PondSocket {
    private readonly _server: Server;
    private readonly _wss: WebSocketServer;
    private readonly _base = new BaseClass();
    private _paths: Endpoint[] = [];
    private _interpreter: Interpreter<GlobalSocketContext, any, GlobalSocketEvent, { value: any; context: GlobalSocketContext; }, any> | undefined;

    constructor(server?: Server, wss?: WebSocketServer) {
        this._server = server || createServer();
        this._wss = wss || new WebSocketServer({noServer: true});
        this.init();
    }

    /**
     * @desc declines an authenticated socket from the pond
     * @param event - the event that is being handled
     * @private
     */
    private static rejectSocketConnection(event: RejectSocketConnection) {
        event.data.data.write(`HTTP/1.1 ${event.data.errorCode} ${event.data.errorMessage}\r\n\r\n`);
        event.data.data.destroy();
    }

    /**
     * @desc rejects a socket connection to the room provided
     * @param event - the event that is being handled
     * @private
     */
    private static sendErrorMessage(event: SendErrorMessage) {
        const message: SocketJoinRoomResponse = {
            topic: "JOIN_ROOM_RESPONSE",
            channel: event.data.data.room,
            payload: {
                status:  "failure",
                response: {
                    error: event.data.errorMessage
                }
            }
        }
        event.data.data.socket.send(JSON.stringify(message));
    }

    /**
     * @desc compares string to string | regex
     * @param string - the string to compare to the pattern
     * @param pattern - the pattern to compare to the string
     */
    private static compareStringToPattern(string: string, pattern: string | RegExp) {
        if (typeof pattern === 'string')
            return string === pattern;
        else {
            return pattern.test(string);
        }
    }

    /**
     * @desc Specifies the port to listen on
     * @param port - the port to listen on
     * @param callback - the callback to call when the server is listening
     */
    public listen(port: number, callback?: (port?: number) => void) {
        return this._server.listen(port, callback);
    }

    /**
     * @desc Accepts a new socket upgrade request on the provided endpoint using the handler function to authenticate the socket
     * @param pattern - the pattern to accept || can also be a regex
     * @param handler - the handler function to authenticate the socket
     *
     * @example
     * const endpoint = pond.createEndpoint('/api/v1/auth', ({request, accept, decline}) => {
     *    const { query } = parse(request.url || '');
     *    const { token } = query;
     *    if (!token)
     *        return decline('No token provided');
     *
     *    accept({ token });
     * })
     */
    public createEndpoint(pattern: string | RegExp, handler: ((request: NewIncomingRequest<IncomingMessage, GlobalAssigns>) => void)): PonEndpoint {
        const newEndpoint: Endpoint = {
            pattern, handler, rooms: [],
        }
        this._paths.push(newEndpoint);
        console.log(this._paths);
        return {
            /**
             * @desc Accepts a new socket join request to the room provided using the handler function to authorise the socket
             * @param pattern - the pattern to accept || can also be a regex
             * @param handler - the handler function to authenticate the socket
             *
             * @example
             * const room = endpoint.createRoom('room:*', ({request, accept, decline}) => {
             *   const isAdmin = request.assigns.admin;
             *   if (!isAdmin)
             *      return decline('You are not an admin');
             *
             *   accept({assigns: {admin: true, joinedDate: new Date()}, presence: {state: online}, roomData: {private: true}});
             * });
             *
             * room.on('ping', ({assigns, roomData, assign}) => {
             *     assign({pingDate: new Date()});
             *     return true;
             * })
             */
            createRoom: (pattern: string | RegExp, handler: ((request: NewIncomingRequest<IncomingJoinRoomRequest, JoinRoomAssigns>) => void)) => {
                return this.createRoom(newEndpoint, pattern, handler);
            }
        }
    }

    /**
     * @desc Accepts a new socket join request to the room provided using the handler function to authorise the socket
     * @param endpoint - the endpoint to accept the socket on
     * @param pattern - the pattern to accept || can also be a regex
     * @param handler - the handler function to authenticate the socket
     * @private
     */
    private createRoom(endpoint: Endpoint, pattern: string | RegExp, handler: ((request: NewIncomingRequest<IncomingJoinRoomRequest, JoinRoomAssigns>) => void)): PondChannel {
        const events = new Map<string, ((outBound: OutBoundChannelEvent) => void)>();
        const channels = this._interpreter?.state.context.channels || new Map<string, Channel>();
        endpoint.rooms.push({pattern, handler, events})
        return {
            /**
             * @desc Adds an event listener to the channel
             * @param event - the event to listen for
             * @param callback - the callback to call when the event is triggered
             */
            on: (event, callback) => {
                events.set(event, callback);
            },

            /**
             * @desc Broadcasts an event to all clients in the room
             * @param roomName - the name of the room to broadcast to
             * @param event - the event to broadcast
             * @param data - the data to broadcast
             */
            broadcast: (roomName: string, event: string, data: default_t) => {
                const channel = channels.get(roomName);
                if (channel)
                    channel.room.broadcast(event, data);
            },

            /**
             * @desc Broadcasts an event to all clients in the room except the clientId provided
             * @param roomName - the name of the room to broadcast to
             * @param clientId - the clientId to exclude from the broadcast
             * @param event - the event to broadcast
             * @param data - the data to broadcast
             */
            broadcastFrom: (roomName: string, clientId: string, event: string, data: default_t) => {
                const channel = channels.get(roomName);
                if (channel)
                    channel.broadcastFrom(clientId, event, data);
            },

            /**
             * @desc Sends an event to the clientId provided
             * @param roomName - the name of the room to broadcast to
             * @param clientId - the clientId to send the event to
             * @param event - the event to broadcast
             * @param data - the data to broadcast
             */
            send: (roomName: string, clientId: string, event: string, data: default_t) => {
                const channel = channels.get(roomName);
                if (channel)
                    channel.privateMessage(clientId, event, data);
            },

            /**
             * @desc Gets the list of clients in the channel
             * @param roomName - the name of the room to get the clients from
             */
            getPresenceList: (roomName) => {
                const channel = channels.get(roomName);
                return channel?.presenceList || [];
            },

            /**
             * @desc Gets the metadata of the channel
             * @param roomName
             */
            getRoomData: (roomName) => {
                const channel = channels.get(roomName);
                return channel?.roomData || {};
            },

            /**
             * @desc Disconnects the client from the channel
             * @param roomName - the name of the room to disconnect from
             * @param clientId - the clientId to disconnect
             */
            disconnect: (roomName, clientId) => {
                const channel = channels.get(roomName);
                if (channel)
                    channel.removeSocket(clientId);
            }
        }
    }

    /**
     * @desc initializes the pond socket service
     * @private
     */
    private init() {
        const stateMachine = createMachine({
            tsTypes: {} as import("./sockets.typegen").Typegen0,
            schema: {
                context: {} as GlobalSocketContext,
                events: {} as GlobalSocketEvent,
                services: {} as GlobalSocketService,
            },
            states: {
                idle: {
                    invoke: {
                        src: "setupServer",
                        onDone: [
                            {
                                target: "ready",
                            },
                        ],
                        onError: [
                            {
                                target: "terminateServer",
                            },
                        ],
                    },
                },
                ready: {
                    on: {
                        shutdown: {
                            target: "terminateServer",
                        },
                        error: {
                            target: "terminateServer",
                        },
                        requestToJoinRoom: {
                            target: "lobby",
                        },
                        newUpgradeRequest: {
                            target: "authoriser",
                        },
                    },
                },
                terminateServer: {
                    entry: "shutDownServer",
                    type: "final",
                },
                lobby: {
                    invoke: {
                        src: "authenticateRoom",
                        onDone: [
                            {
                                actions: "joinRoom",
                                target: "ready",
                            },
                        ],
                        onError: [
                            {
                                actions: "sendErrorMessage",
                                target: "ready",
                            },
                        ],
                    },
                },
                authoriser: {
                    invoke: {
                        src: "authenticateSocket",
                        onDone: [
                            {
                                actions: "addSocketToDB",
                                target: "ready",
                            },
                        ],
                        onError: [
                            {
                                actions: "rejectSocketConnection",
                                target: "ready",
                            },
                        ],
                    },
                },
            },
            context: {
                channels: new Map(),
                sockets: new Map(),
            },
            predictableActionArguments: true,
            id: "globalSockets",
            initial: "idle",
        }, {
            actions: {
                sendErrorMessage: (_ctx, event) => PondSocket.sendErrorMessage(event),
                joinRoom: (context, event) => this.joinRoom(context, event),
                addSocketToDB: (context, event) => this.addSocketToDB(context, event),
                rejectSocketConnection: (_ctx, event) => PondSocket.rejectSocketConnection(event),
                shutDownServer: (context, event) => this.shutDownServer(context, event),
            }, services: {
                authenticateRoom: (context, event) => this.authenticateRoom(context, event),
                authenticateSocket: (context, event) => this.authenticateSocket(context, event),
                setupServer: (context) => this.setupServer(context),
            }
        });

        this._interpreter = interpret(stateMachine).start();
    }

    /**
     * @desc generate an accept function for the socket connection
     * @param obj - the object that is being accepted
     * @param resolve - the resolve function of the promise
     * @param endpoint - the endpoint of the socket connection
     * @private
     */
    private generateAccept(obj: Omit<IncomingRequest, 'type'>, resolve: (value: AddSocketPromise) => void, endpoint: string) {
        return <T extends object>(assigns?: T) => {
            this._wss.handleUpgrade(obj.request, obj.socket, obj.head, (ws) => {
                assigns = assigns || {} as T;
                const clientId = this._base.createUUID();
                this._wss.emit('connection', ws, {...assigns, clientId});

                ws.on('message', (message) => {
                    try {
                        const data = JSON.parse(message.toString()) as SocketClientMessageType;
                        if (data.topic === 'NEW_INCOMING_REQUEST' && data.channel && data.payload)
                            this._interpreter?.send({
                                type: 'requestToJoinRoom',
                                clientId, socket: ws, roomToJoin: data.channel, endpoint,
                                assigns: {...assigns, id: clientId}, roomData: data.payload?.roomData || {},
                            });
                    } catch (e) {
                        const message: DefaultServerErrorResponse = {
                            topic: "ERROR_RESPONSE",
                            channel: '*',
                            payload: {
                                error: "INVALID_JSON",
                                errorCode: 504
                            }
                        }
                        ws.send(JSON.stringify(message));
                    }
                })

                resolve({
                    clientId,
                    socket: ws,
                    assigns: assigns,
                })
            })
        }
    }

    /**
     * @desc authenticate a socket connection
     * @param _context - the context of the state machine
     * @param event - the event that is being handled
     * @private
     */
    private authenticateSocket(_context: GlobalSocketContext, event: IncomingRequest) {
        return BasePromise<AddSocketPromise, internal.Duplex>((resolve, reject) => {
            const {pathname} = parse(event.request.url || '');
            if (!pathname)
                return reject('No pathname provided', 400, event.socket);

            const auth = this._paths.find(p => PondSocket.compareStringToPattern(pathname, p.pattern));

            if (!auth)
                return reject('No authentication found for this endpoint', 404, event.socket);

            auth.handler({
                request: event.request,
                accept: this.generateAccept(event, resolve, pathname),
                decline: (message: string) => reject(message, 401, event.socket)
            });
        })
    }

    /**
     * @desc adds a newly authenticated socket to the pond
     * @param context - the context of the state machine
     * @param event - the event that is being handled
     * @private
     */
    private addSocketToDB(context: GlobalSocketContext, event: AddSocketToDB) {
        const assigns = {
            ...event.data.assigns,
            clientId: event.data.clientId,
        };
        assign({
            sockets: new Map(context.sockets.set(event.data.socket, assigns))
        });
    }

    /**
     * @desc authorises a socket connection to the room provided
     * @param _context - the context of the state machine
     * @param event - the event that is being handled
     * @private
     */
    private authenticateRoom(_context: GlobalSocketContext, event: AuthenticateRoom) {
        return BasePromise<JoinRoomPromise, {
            room: string;
            socket: WebSocket;
        }>((resolve, reject) => {
            const {roomToJoin, endpoint} = event;

            const auth = this._paths.find(p => PondSocket.compareStringToPattern(endpoint, p.pattern))?.rooms.find(r => PondSocket.compareStringToPattern(roomToJoin, r.pattern));

            if (!auth)
                return reject('No authentication found for this endpoint', 404, {
                    room: roomToJoin,
                    socket: event.socket,
                });

            auth.handler({
                request: event,
                accept: (data) => {
                    const newAssigns = {...event.assigns, ...data?.assigns};
                    const newPresence = {...{}, ...data?.presence};
                    const newRoomData = {...{}, ...data?.roomData};
                    resolve({
                        endpoint,
                        clientId: event.clientId,
                        assigns: newAssigns,
                        presence: newPresence,
                        roomData: newRoomData,
                        socket: event.socket,
                        roomName: roomToJoin,
                        verifiers: auth.events,
                    })
                },
                decline: (message: string) => reject(message, 401, {
                    room: roomToJoin,
                    socket: event.socket,
                })
            });
        })
    }

    /**
     * @desc adds a newly authenticated socket to the room provided
     * @param context - the context of the state machine
     * @param event - the event that is being handled
     * @private
     */
    private joinRoom(context: GlobalSocketContext, event: SocketJoinRoom) {
        const accessor = this._base.encrypt(event.data.endpoint, {room: event.data.roomName});
        let channel = context.channels.get(accessor);
        if (!channel || channel.state === 'inactive')
            channel = new Channel(event.data.roomName, event.data.roomData, event.data.verifiers);

        channel.addSocket(event.data);
        assign({
            channels: new Map(context.channels.set(accessor, channel))
        });
    }

    /**
     * @desc shuts down the pond and closes all sockets
     * @param _context - the context of the state machine
     * @param _event - the event that is being handled
     * @private
     */
    private shutDownServer(_context: GlobalSocketContext, _event: any) {
        this._wss.clients.forEach(client => client.terminate());
        this._wss.close();
        this._server.close();
        this._interpreter?.stop();
        process.exit(0);
    }

    /**
     * @desc starts the pond server
     * @param _context - the context of the state machine
     * @private
     */
    private setupServer(_context: GlobalSocketContext) {
        return new Promise<void>((resolve, reject) => {
            this._server.on('upgrade', (request, socket, head) => {
                this._interpreter?.send({
                    type: 'newUpgradeRequest',
                    request, head, socket,
                })
            });
            this._server.on('error', (error) => {
                return reject(error);
            });
            this._server.on('listening', () => {
                this.pingClients(this._wss);
                return resolve();
            });
        });
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
}
