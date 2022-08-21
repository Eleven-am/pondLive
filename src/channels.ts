import {Subject, Subscription} from "rxjs";
import {assign, BaseActionObject, createMachine, interpret, Interpreter, StateMachine} from "xstate";
import {default_t, JoinRoomPromise, NewIncomingRequest} from "./sockets";
import {BaseMap, BasePromise, PondError, RejectPromise} from "./base";

type SocketJoinRoomRequest = {
    topic: "NEW_INCOMING_REQUEST";
    channel: string;
    payload: {
        roomData: default_t;
    }
}

export type SocketJoinRoomResponse = {
    topic: "JOIN_ROOM_RESPONSE";
    channel: string;
    payload: {
        status: "success" | "failure";
        response: {
            error?: string
        }
    }
}

export type DefaultServerErrorResponse = {
    topic: "ERROR_RESPONSE";
    channel: string;
    payload: {
        error: string;
        errorCode: number;
    }
}

type SocketLeaveRoomRequest = {
    topic: "LEAVE_ROOM_REQUEST";
    channel: string;
    payload: {}
}

type SocketPresenceUpdate = {
    topic: "PRESENCE_UPDATE";
    channel: string;
    payload: {
        joins: (default_t & { id: string })[];
        leaves: (default_t & { id: string })[];
        response: default_t;
    }
}

type SocketPresenceBrief = {
    topic: "PRESENCE_BRIEF";
    channel: string;
    payload: {
        presence: (default_t & { id: string })[];
        response: default_t;
    }
}

type SocketServerMessage = {
    topic: "MESSAGE";
    channel: string;
    sender: 'server';
    payload: {
        message: default_t;
        response: default_t;
        timestamp: string;
        sentBy: string | null;
    }
}

type SocketClientMessage = {
    topic: "MESSAGE";
    channel: string;
    mode: 'BROADCAST' | 'BROADCAST_EXCEPT_SELF' | 'BROADCAST_TO_ASSIGNED';
    payload: {
        event: string;
        message: default_t;
        timestamp: string;
        assignedTo: string[] | null;
    }
}

type SocketServerErrorMessage = {
    topic: "ERROR_MESSAGE";
    channel: string;
    sender: 'server';
    payload: {
        error: string;
        response: default_t;
        errorCode: number;
    }
}

export type SocketClientMessageType = SocketClientMessage | SocketJoinRoomRequest | SocketLeaveRoomRequest

interface UserMessageEvent<T = any> {
    payload?: T;
    channel: string;
    event: 'joinRoom' | 'leaveRoom' | 'sendMessage' | 'updatePresence';
    addresses: string[] | 'all' | 'allExcept';
    emitter: 'userMessage';
    clientId: string;
}

interface ChannelMessageEvent<T = any> {
    payload?: T;
    timestamp: string;
    channel: string;
    event: 'presenceBrief' | 'presenceChange' | 'broadcastFrom' | 'broadcast' | 'privateMessage' | 'errorMessage';
    addresses: string[];
    emitter: 'channelMessage';
    senderId: string;
}

export type Presence<T> = default_t<T> & { id: string };

type Assign<T> = default_t<T> & { id: string };

type RoomData<T = any> = default_t<T> & { id: string };

interface ChannelsContext<T = any> {
    presences: BaseMap<string, Omit<Presence<T>, 'id'>>;
    assigns: BaseMap<string, Omit<Assign<T>, 'id'>>;
}

type ChannelJoinRoomEvent = {
    type: 'joinRoom';
    clientId: string;
    data: JoinRoomPromise;
}

type ChannelUpdatePresenceEvent = {
    type: 'updatePresence';
    clientId: string;
    presence: default_t;
}

type ChannelLeaveRoomEvent = {
    type: 'leaveRoom';
    clientId: string;
}

type InternalPondChannel = {
    getPresenceList: <T>() => Presence<T>[];
    getRoomData: () => default_t;
    disconnect: (clientId: string) => void;
    broadcast: (event: string, payload: default_t) => void;
    broadcastFrom: (clientId: string, event: string, payload: default_t) => void;
    send: (clientId: string, event: string, payload: default_t) => void;
}

type ChannelMessageBody = {
    message: default_t & { event: string };
    clientId: string;
    assigns: default_t
    targets: string[] | 'all' | 'allExcept';
    severSent: boolean;
}

type ChannelSendMessageEvent = {
    type: 'sendMessage';
} & ChannelMessageBody;

type ChannelSendMessageSuccessEvent = {
    message: string;
    clientId: string;
    assigns: default_t;
    presence: default_t;
    targets: string[] | 'all' | 'allExcept';
}

type ChannelService = {
    canPerformAction: {
        data: ChannelSendMessageSuccessEvent;
    }
}

type SendMessageErrorEvent = {
    type: 'error.platform.channels.authoriseMessage:invocation[0]' | 'errorMessage';
    data: RejectPromise<{
        addresses: string[];
        clientId: string;
    }>;
}

type ChannelEvent =
    ChannelJoinRoomEvent
    | ChannelUpdatePresenceEvent
    | ChannelLeaveRoomEvent
    | ChannelSendMessageEvent
    | SendMessageErrorEvent;

export type OutBoundChannelEvent =
    NewIncomingRequest<Omit<ChannelMessageBody, 'targets' | 'severSent'>, { assigns?: default_t, presence?: default_t }>
    & { room: InternalPondChannel };

export type ChannelMessageEventVerifiers = BaseMap<string | RegExp, ((outBound: OutBoundChannelEvent) => void)>;

type Machine = StateMachine<ChannelsContext, any, ChannelJoinRoomEvent | ChannelUpdatePresenceEvent | ChannelLeaveRoomEvent | ChannelSendMessageEvent | SendMessageErrorEvent, any, BaseActionObject, ChannelService, any>

export class Channel {
    public readonly channel: string;
    public readonly _state$: Subject<ChannelMessageEvent | UserMessageEvent>;
    private _isActive: boolean;
    private readonly _messageEventVerifiers: ChannelMessageEventVerifiers;
    private _interpreter: Interpreter<ChannelsContext, any, ChannelEvent, { value: any; context: ChannelsContext; }, any> | undefined;

    constructor(channel: string, roomData: RoomData, verifiers: ChannelMessageEventVerifiers) {
        this.channel = channel;
        this._roomData = roomData;
        this._isActive = false;
        this._messageEventVerifiers = verifiers;
        this._state$ = new Subject<ChannelMessageEvent | UserMessageEvent>();
        this.init();
    }

    private _roomData: RoomData;

    /**
     * @desc Getter for the room data of the channel
     */
    public get roomData(): RoomData {
        return this._roomData;
    }

    /**
     * @desc checks if the channel is active
     */
    public get state(): 'active' | 'inactive' {
        return this._isActive ? 'active' : 'inactive';
    }

    /**
     * @desc Getter for the context of the state machine
     */
    public get context(): ChannelsContext | undefined {
        return this._interpreter?.state.context;
    }

    /**
     * @desc Gets the presence list of the channel
     */
    public get presenceList(): Presence<any>[] {
        return this.context?.presences.toArray() || [];
    }

    /**
     * @desc Getter for the internal channel
     * @private
     */
    public get room(): InternalPondChannel {
        return {
            getPresenceList: () => this.presenceList,
            getRoomData: () => this._roomData,
            disconnect: this.removeSocket.bind(this),
            broadcast: this.broadcast.bind(this),
            broadcastFrom: this.broadcastFrom.bind(this),
            send: this.privateMessage.bind(this)
        }
    }

    /**
     * @desc Checks if the channel has at least one user
     */
    private static atLeastOneUser(ctx: ChannelsContext, evt: ChannelLeaveRoomEvent): boolean {
        return ctx.presences.allExcept(evt.clientId).length > 0;
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
     * @desc adds the user to the channel
     * @param event - The event that triggered the transition
     */
    public addSocket(event: JoinRoomPromise): void {
        const {roomData, clientId} = event;
        this._roomData = {...this._roomData, ...roomData};

        const client = this.context?.presences.get(clientId);
        if (client) {
            const message: SocketJoinRoomResponse = {
                topic: "JOIN_ROOM_RESPONSE",
                channel: this.channel,
                payload: {
                    status: "failure",
                    response: {
                        error: "already_joined",
                    }
                }
            }
            event.socket.send(JSON.stringify(message));
            return;
        }

        const subscription = this.subscribeToState(event);
        const message: SocketJoinRoomResponse = {
            topic: "JOIN_ROOM_RESPONSE",
            channel: this.channel,
            payload: {
                status: "success",
                response: {}
            }
        };
        event.socket.send(JSON.stringify(message));

        this._interpreter?.send({
            type: 'joinRoom',
            clientId, data: event
        });
        this._interpreter?.onStop(() => {
            subscription.unsubscribe();
        })
    }

    /**
     * @desc removes the user from the channel
     * @param clientId - The client id of the user
     */
    public removeSocket(clientId: string): void {
        this._interpreter?.send({
            type: 'leaveRoom',
            clientId: clientId
        });
    }

    /**
     * @desc broadcasts a message to the channel
     * @param event - The event that triggered the message
     * @param message - The message to broadcast
     */
    public broadcast(event: string, message: default_t): void {
        const data: ChannelSendMessageEvent = {
            severSent: true,
            type: 'sendMessage',
            clientId: 'SERVER', assigns: {},
            message: {event, payload: message},
            targets: 'all'
        }
        this._interpreter?.send(data);
    }

    /**
     * @desc broadcasts from a user to a message to the channel
     * @param clientId - The client id of the user
     * @param event - The event that triggered the message
     * @param message - The message to broadcast
     */
    public broadcastFrom(clientId: string, event: string, message: default_t): void {
        const data: ChannelSendMessageEvent = {
            severSent: true,
            type: 'sendMessage',
            clientId: clientId, assigns: {},
            message: {event, payload: message},
            targets: 'allExcept'
        }
        this._interpreter?.send(data);
    }

    /**
     * @desc sends a message to a user
     * @param clientId - The client id of the user
     * @param event - The event that triggered the message
     * @param message - The message to send
     */
    public privateMessage(clientId: string, event: string, message: default_t): void {
        const data: ChannelSendMessageEvent = {
            severSent: true,
            type: 'sendMessage',
            clientId: 'SERVER', assigns: {},
            message: {event, payload: message},
            targets: [clientId]
        }
        this._interpreter?.send(data);
    }

    /**
     * @desc initialises the channel
     * @private
     */
    private init(): void {
        const stateMachine: Machine = createMachine({
            tsTypes: {} as import("./channels.typegen").Typegen0,
            schema: {
                context: {} as ChannelsContext,
                events: {} as ChannelEvent,
                services: {} as ChannelService,
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
                presences: new BaseMap<string, Omit<Presence<any>, "id">>(),
                assigns: new BaseMap<string, Omit<Assign<any>, "id">>(),
            },
            predictableActionArguments: true,
            id: this.channel,
            initial: "idle",
        }, {
            actions: {
                modifyPresence: (ctx, evt) => this.modifyPresence(ctx, evt),
                sendTheMessages: (ctx, evt) => this.sendTheMessages(ctx, evt.data),
                sendErrorMessage: (ctx, evt) => this.sendErrorMessage(ctx, evt),
                shutDownChannel: (ctx, evt) => this.shutDownChannel(ctx, evt),
            },
            guards: {
                atLeastOneUser: (ctx, evt) => Channel.atLeastOneUser(ctx, evt),
            },
            services: {
                canPerformAction: (ctx, evt) => this.canPerformAction(ctx, evt),
            }
        });

        this._interpreter = interpret(stateMachine).start();
        this._isActive = true;
    }

    /**
     * @desc Modifies the of the users in the channel
     * @param context - The current context of the state machine
     * @param event - The event that triggered the transition
     * @private
     */
    private modifyPresence(context: ChannelsContext, event: ChannelJoinRoomEvent | ChannelUpdatePresenceEvent | ChannelLeaveRoomEvent): void {
        const presence = context.presences.get(event.clientId);
        const leaves = [{...presence, id: event.clientId}];
        const timestamp = new Date().toISOString();
        switch (event.type) {
            case 'updatePresence':
                if (presence) {
                    const updateFSMPresence = {...event.presence, id: event.clientId};
                    this._state$.next({
                        emitter: 'channelMessage',
                        channel: this.channel,
                        event: 'presenceChange', timestamp,
                        addresses: Array.from(context.presences.keys()),
                        payload: {joins: [updateFSMPresence], leaves},
                        senderId: event.clientId,
                    })

                    assign({
                        presences: new BaseMap(context.presences.set(event.clientId, updateFSMPresence)),
                    });
                }
                break;

            case 'leaveRoom':
                this._state$.next({
                    channel: this.channel,
                    event: 'presenceChange',
                    emitter: 'channelMessage', timestamp,
                    addresses: context.presences.allExcept(event.clientId).map(p => p.id),
                    payload: {joins: [], leaves},
                    senderId: event.clientId,
                });

                assign({
                    presences: new BaseMap(context.presences.deleteKey(event.clientId)),
                    assigns: new BaseMap(context.assigns.deleteKey(event.clientId)),
                });
                break;

            case 'joinRoom':
                const currentPresence = context.presences.allExcept(event.clientId);
                assign({
                    presences: new BaseMap(context.presences.set(event.clientId, {...event.data.presence})),
                    assigns: new BaseMap(context.assigns.set(event.clientId, {...event.data.assigns})),
                });
                this._state$.next({
                    timestamp,
                    channel: this.channel,
                    event: 'presenceBrief',
                    addresses: [event.clientId],
                    emitter: 'channelMessage',
                    payload: {currentPresence},
                    senderId: event.clientId,
                });
                this._state$.next({
                    channel: this.channel,
                    event: 'presenceChange',
                    emitter: 'channelMessage', timestamp,
                    payload: {joins: [{...event.data.presence, id: event.clientId}], leaves: []},
                    addresses: Array.from(context.presences.keys()),
                    senderId: event.clientId,
                });
                break;
        }
    }

    /**
     * @desc sends an error message to the user in the channel
     * @param _context - The current context of the state machine
     * @param event - The event that triggered the transition
     */
    private sendErrorMessage(_context: ChannelsContext, event: SendMessageErrorEvent): void {
        const message: ChannelMessageEvent = {
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
    }

    /**
     * @desc sends the message to the users in the channel
     * @param context - The current context of the state machine
     * @param event - The event that triggered the transition
     */
    private sendTheMessages(context: ChannelsContext, event: ChannelSendMessageSuccessEvent): void {
        let addresses = Array.from(context.presences.keys());
        let broadcastType: 'broadcast' | 'broadcastFrom' | 'privateMessage' = 'broadcast';

        if (event.targets !== 'all') {
            if (event.targets === 'allExcept') {
                broadcastType = 'broadcastFrom';
                addresses = addresses.filter(p => p !== event.clientId);

            } else {
                addresses = event.targets;
                broadcastType = 'privateMessage';
            }
        }

        const message: ChannelMessageEvent = {
            channel: this.channel,
            event: broadcastType, addresses,
            emitter: 'channelMessage',
            senderId: event.clientId,
            timestamp: new Date().toISOString(),
            payload: event.message,
        };

        this._state$.next(message);
        assign({
            assigns: new Map(context.assigns.set(event.clientId, {...context.assigns.get(event.clientId), ...event.assigns})),
        })
    }

    /**
     * @desc shuts down the channel
     * @param _context - The current context of the state machine
     * @param _event - The event that triggered the transition
     */
    private shutDownChannel(_context: ChannelsContext, _event: ChannelLeaveRoomEvent): void {
        this._state$.complete();
        this._interpreter?.stop();
        this._isActive = false;
    }

    /**
     * @desc subscribes to the state of the channel
     */
    private subscribeToState(event: JoinRoomPromise): Subscription {
        const {clientId, socket} = event;
        const subscription = this._state$.subscribe(state => {
            if (state.emitter === 'channelMessage' && state.addresses.includes(clientId)) {
                if (state.event === 'presenceBrief') {
                    const data: SocketPresenceBrief = {
                        topic: 'PRESENCE_BRIEF',
                        channel: this.channel,
                        payload: {
                            presence: state.payload.currentPresence,
                            response: {}
                        }
                    };
                    const message = JSON.stringify(data);
                    socket.send(message);
                } else if (state.event === 'presenceChange') {
                    const data: SocketPresenceUpdate = {
                        topic: 'PRESENCE_UPDATE',
                        channel: this.channel,
                        payload: {
                            joins: state.payload.joins,
                            leaves: state.payload.leaves,
                            response: {}
                        }
                    };
                    const message = JSON.stringify(data);
                    socket.send(message);
                } else if (state.event === 'errorMessage') {
                    const data: SocketServerErrorMessage = {
                        topic: 'ERROR_MESSAGE',
                        channel: this.channel,
                        sender: 'server',
                        payload: {
                            error: state.payload.message,
                            errorCode: state.payload.errorCode,
                            response: {}
                        }
                    }

                    const message = JSON.stringify(data);
                    socket.send(message);
                } else if (state.event === 'broadcast' || state.event === 'broadcastFrom' || state.event === 'privateMessage') {
                    const data: SocketServerMessage = {
                        topic: 'MESSAGE',
                        channel: this.channel,
                        sender: 'server',
                        payload: {
                            message: state.payload,
                            response: {},
                            sentBy: state.senderId,
                            timestamp: new Date().toISOString()
                        }
                    };
                    const message = JSON.stringify(data);
                    socket.send(message);
                }
            }
        })

        this.subscribeToSocket(event, subscription);
        return subscription;
    }

    /**
     * @desc subscribes to the state of the socket
     * @param event - The event that triggered the transition
     * @param subscription - The subscription to the socket state
     */
    private subscribeToSocket(event: JoinRoomPromise, subscription: Subscription) {
        const {socket, clientId} = event;
        socket.on('message', async (message: string) => {
            try {
                const data = await this.readMessage(message, clientId);
                if (data.topic === 'LEAVE_ROOM_REQUEST') {
                    this._interpreter?.send({
                        type: 'leaveRoom',
                        clientId: clientId
                    });

                    subscription.unsubscribe();
                } else if (data.topic === 'MESSAGE' && data.payload.event) {
                    let message: ChannelSendMessageEvent | null = null;
                    const assigns = this.context?.assigns.get(clientId) || {};
                    const presence = this.presenceList || [];
                    if (data.mode === 'BROADCAST')
                        message = {
                            severSent: false,
                            type: 'sendMessage',
                            clientId, assigns,
                            message: {...data.payload.message, event: data.payload.event},
                            targets: 'all'
                        }

                    else if (data.mode === 'BROADCAST_EXCEPT_SELF') {
                        const targets = presence.filter(presence => presence.id !== clientId).map(presence => presence.id);
                        message = {
                            severSent: false,
                            type: 'sendMessage',
                            clientId, assigns, targets,
                            message: {...data.payload.message, event: data.payload.event},
                        }
                    } else if (data.mode === 'BROADCAST_TO_ASSIGNED' && data.payload.assignedTo)
                        message = {
                            severSent: false,
                            type: 'sendMessage',
                            clientId, assigns, targets: data.payload.assignedTo,
                            message: {...data.payload.message, event: data.payload.event},
                        }

                    if (message !== null)
                        this._interpreter?.send(message);

                    else
                        this._interpreter?.send({
                            type: 'errorMessage',
                            data: new PondError('Invalid message mode', 400, {
                                addresses: [clientId],
                                clientId: clientId,
                            })
                        })
                }
            } catch (error) {
                this._interpreter?.send({
                    type: 'errorMessage',
                    data: error as RejectPromise<{ addresses: string[], clientId: string }>
                })
            }
        });

        socket.onclose = () => {
            this._interpreter?.send({
                type: 'leaveRoom',
                clientId: clientId
            });
            subscription.unsubscribe();
        };

        socket.onerror = () => {
            this._interpreter?.send({
                type: 'leaveRoom',
                clientId: clientId
            });
            subscription.unsubscribe();
        };
    }

    /**
     * @desc checks if the user can perform the action
     * @param context - The current context of the state machine
     * @param event - The event that triggered the transition
     */
    private canPerformAction(context: ChannelsContext, event: ChannelSendMessageEvent) {
        return BasePromise<ChannelSendMessageSuccessEvent, { addresses: string[], clientId: string }>((resolve, reject) => {
            let message: default_t & { event?: string } = event.message;
            delete message.event;
            if (event.severSent)
                resolve({
                    message: JSON.stringify(message),
                    clientId: event.clientId,
                    targets: event.targets,
                    assigns: event.assigns,
                    presence: {},
                })

            const verifier = this._messageEventVerifiers.toKeyValueArray().find(verifier => Channel.compareStringToPattern(event.message.event, verifier.key));
            const client = context.presences.get(event.clientId);
            if (!client)
                return reject('Action forbidden: You are currently not in the channel', 403, {
                    addresses: [event.clientId],
                    clientId: event.clientId
                });

            if (verifier) {
                let newAssigns = event.assigns;
                let newPresence = client;
                const getAssigns = (assigns?: { assigns?: default_t, presence?: default_t }): void => {
                    if (assigns) {
                        newAssigns = {...newAssigns, ...assigns.assigns};
                        newPresence = {...newPresence, ...assigns.presence};
                    }

                    resolve({
                        targets: event.targets,
                        clientId: event.clientId,
                        message: JSON.stringify(message),
                        presence: newPresence,
                        assigns: newAssigns,
                    });
                }
                const deny = (errorMessage: string): void => {
                    reject(errorMessage, 403, {addresses: [event.clientId], clientId: event.clientId});
                }

                const outbound: OutBoundChannelEvent = {
                    accept: getAssigns,
                    decline: deny,
                    room: this.room,
                    request: {
                        message: event.message,
                        clientId: event.clientId,
                        assigns: event.assigns,
                    }
                }
                verifier.value(outbound);

            } else
                return resolve({
                    message: JSON.stringify(message),
                    clientId: event.clientId,
                    targets: event.targets,
                    assigns: event.assigns,
                    presence: client,
                })
        });
    }

    /**
     * @desc Reads socket message from the client
     * @param message - The message from the client
     * @param clientId - The client id of the client
     */
    private readMessage(message: string, clientId: string) {
        return BasePromise<SocketClientMessageType, { addresses: string[], clientId: string }>((resolve, reject) => {
            try {
                const data = JSON.parse(message) as SocketClientMessageType
                if (data.channel && data.channel === this.channel)
                    if (this.context?.presences.has(clientId))
                        resolve(data);

                    else
                        reject('Action forbidden: You are currently not in the channel', 403, {
                            addresses: [clientId],
                            clientId: clientId
                        });
            } catch (e: any) {
                return reject(e.message, 500, {addresses: [clientId], clientId});
            }
        })
    }
}
