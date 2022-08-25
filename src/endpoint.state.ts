import {IncomingMessage, Server} from "http";
import {assign, createMachine, interpret, Interpreter, InterpreterStatus} from "xstate";
import {
    default_t,
    IncomingChannelMessage,
    IncomingJoinMessage,
    InternalAssigns,
    PondChannelData,
    PondPresence,
    PondResponse
} from "../index";
import {InternalPassSocketToEndPointEvent} from "./server.state";
import internal from "stream";
import {BaseClass, BaseMap, BasePromise, RejectPromise} from "./utils";
import {Subject} from "rxjs";
import {filter} from 'rxjs/operators';
import {WebSocket, WebSocketServer} from "ws";
import {ChannelInterpreter, ChannelMachine} from "./channel.state";
import {InternalPondChannel} from "./channel";

type GetHandlerEvent = {
    type: "getHandler"; data: {
        endpoint: string; handler: (req: IncomingMessage, res: PondResponse) => void;
    }
}

type AuthenticateSocketEvent = {
    type: "authenticateSocket"; data: InternalPassSocketToEndPointEvent;
}

type AuthenticateSocketSuccessEvent = {
    type: 'done.invoke.(machine).performAuth:invocation[0]', data: AuthenticateSocketSubSuccessEvent;
}

type AuthenticateSocketSubSuccessEvent = {
    clientId: string; socket: WebSocket; assigns: InternalAssigns;
}

type AuthenticateSocketErrorEvent = {
    type: 'error.platform.(machine).performAuth:invocation[0]', data: RejectPromise<internal.Duplex>;
}

type JoinChannelRequestEvent = {
    type: "joinChannelRequest"; data: {
        channelName: string; clientId: string; assigns: InternalAssigns;
    }
}

type JoinChannelRequestSuccessEvent = {
    type: 'done.invoke.(machine).authoriseSocket:invocation[0]', data: JoinChannelRequestSubSuccessEvent
}

export type JoinChannelRequestSubSuccessEvent = {
    channelName: string;
    clientId: string;
    assigns: InternalAssigns;
    presence: InternalAssigns;
    channelData: PondChannelData & { channelId: string };
}

type JoinChannelRequestErrorEvent = {
    type: 'error.platform.(machine).authoriseSocket:invocation[0]', data: RejectPromise<JoinChannelRequestSubErrorEvent>;
}

type JoinChannelRequestSubErrorEvent = {
    channelName: string; clientId: string; assigns: InternalAssigns;
}

export type EndpointEvent =
    GetHandlerEvent
    | AuthenticateSocketEvent
    | JoinChannelRequestEvent
    | AuthenticateSocketSuccessEvent
    | AuthenticateSocketErrorEvent
    | JoinChannelRequestSuccessEvent
    | JoinChannelRequestErrorEvent;

export type EndpointContext = {
    handler: (req: IncomingMessage, res: PondResponse) => void;
    socketServer: WebSocketServer; observable: Subject<EndpointInternalEvents>; server: Server;
    authorizers: BaseMap<string | RegExp, {
        handler: (req: IncomingJoinMessage, res: PondResponse) => void
        events: BaseMap<string | RegExp, (req: IncomingChannelMessage, res: PondResponse, room: InternalPondChannel) => void>;
    }>; channels: BaseMap<string, ChannelInterpreter>;
}

export type EndpointInterpreter = Interpreter<EndpointContext, any, EndpointEvent, { value: any; context: EndpointContext; }, any>

export type EndpointInternalClientDisconnectedEvent = {
    type: 'CLIENT';
    event: 'CLIENT_DISCONNECTED';
    clientId: string;
}

type EndpointInternalClientEmittedEvents = {
    type: 'CLIENT';
    event: 'JOIN_CHANNEL' | 'LEAVE_CHANNEL';
    clientId: string;
    channelName: string;
    payload: default_t;
}

type EndpointInternalClientBroadCastMessageEvents = {
    type: 'CLIENT';
    event: 'BROADCAST_MESSAGE' | 'BROADCAST_FROM';
    subEvent: string;
    clientId: string;
    channelName: string;
    payload: default_t;
}

type EndpointInternalClientSendMessageEvents = {
    type: 'CLIENT';
    event: 'SEND_MESSAGE';
    subEvent: string;
    clientId: string;
    channelName: string;
    payload: default_t;
    addresses: string[];
}

type EndpointInternalChannelEvent = {
    type: 'SERVER';
    event: 'PRESENCE_UPDATE' | 'DISCONNECT_CLIENT_FROM_CHANNEL';
    channelId: string;
    channelName: string;
    addresses: string[];
    payload: default_t;
}

type EndpointInternalChannelMessageEvent = {
    type: 'SERVER';
    event: 'BROADCAST_MESSAGE_TO_CHANNEL';
    channelId: string;
    subEvent: string;
    channelName: string;
    addresses: string[];
    payload: default_t;
}

export type EndpointInternalChannelErrorEvent = {
    type: 'SERVER';
    event: 'CHANNEL_SHUTDOWN' | 'CHANNEL_ERROR';
    channelId: string;
    channelName: string;
    reason: string;
    addresses: string[];
}

export type EndpointInternalServerErrorEvent = {
    type: 'SERVER';
    event: 'SERVER_ERROR';
    reason: string;
    addresses: string[];
}

type EndpointDisconnectEvent = {
    type: 'SERVER';
    event: 'DISCONNECT_CLIENT';
    addresses: string[];
}

type EndpointMessageEvent = {
    type: 'SERVER';
    event: 'BROADCAST_MESSAGE' | 'DISCONNECT_CLIENT';
    subEvent: string;
    addresses: string[];
    payload: default_t;
}

export type EndpointInternalClientEvent =
    EndpointInternalClientEmittedEvents
    | EndpointInternalClientDisconnectedEvent
    | EndpointInternalClientBroadCastMessageEvents
    | EndpointInternalClientSendMessageEvents;

export type EndpointInternalServerEvent =
    EndpointInternalChannelEvent
    | EndpointInternalChannelMessageEvent
    | EndpointMessageEvent
    | EndpointDisconnectEvent
    | EndpointInternalServerErrorEvent
    | EndpointInternalChannelErrorEvent;

export type EndpointInternalEvents = EndpointInternalClientEvent | EndpointInternalServerEvent;

type ClientSentMessages = {
    action: 'SEND_MESSAGE' | 'BROADCAST_MESSAGE' | 'BROADCAST_FROM' | 'JOIN_CHANNEL' | 'LEAVE_CHANNEL';
    event: string;
    channelName: string;
    payload: default_t;
    addresses?: string[];
}

type ServerSentMessages = {
    action: 'PRESENCE_UPDATE' | 'CHANNEL_ERROR' | 'MESSAGE' | 'DISCONNECT_CLIENT' | 'SERVER_ERROR';
    channelId: string;
    channelName: string;
    payload: default_t;
}

export class EndpointMachine {
    public readonly interpreter: EndpointInterpreter;
    private readonly base: BaseClass;

    constructor(ctx: EndpointContext, endpointId: string) {
        this.base = new BaseClass();
        this.interpreter = this.start(ctx, endpointId);
    }

    /**
     * @desc Rejects a socket connection
     * @param _ctx - The context of the endpoint machine
     * @param evt - The event that triggered the action
     */
    private static rejectSocketConnection(_ctx: EndpointContext, evt: AuthenticateSocketErrorEvent) {
        evt.data.data.write(`HTTP/1.1 ${evt.data.errorCode} ${evt.data.errorMessage}\r\n\r\n`);
        evt.data.data.destroy();
    }

    /**
     * @desc Start the endpoint machine.
     * @param ctx - The context to start the machine with.
     * @param endpointId - The id of the endpoint.
     * @private
     */
    private start(ctx: EndpointContext, endpointId: string) {
        const machine = /** @xstate-layout N4IgpgJg5mDOIC5RgHYQA4HsCWKAuAdAE5gCGEAngMSkCueAFqntgMal5gDKmrA1mDyJQWWNhaYUwkAA9EAWgCMigKwA2AmsUAWAByKAzKoCcagAwGA7ABoQFBdsWWC2s8cUAmT5a+W-AX39bVAwcfGIySioAKzCAYQZSFBQwABsAJTAAR1o4ISQQUXFsSWk5BCVVRRcDVw8zS0VjXRa1W3sKtV1jFw8PbsU1SzM1DwMPQOC0LFxCdDAiADNMIgBbAEF6BioISTACXAA3TAECEJnw+aWVja2EI94OEpQAbTMAXWkiiSkC8qVtNoDARBioLGDtGpmj52g4DBpjGYPK5IboDGYVAZdJNwNMwnMFss1ptGFQFkQVgR0KkOETVmc8bMqYSbiSGPcUMd2D83p8Ct9nmUFMYsQRdNo+mZWminB5YRUgQikVjFejdGptDjzviCHRGCtsLBuLwBHgdnsDpyTvttUy9QwDUaePxBByuU9JLyvpgxD8hRUdLpnMjTCoRQYVP0DPL5I0emj+ipXCpLCowdigrjQnato7jS6zeTKdTaTcGdnwva887TW7HjyPt7fYK-sLkQR4V1If0PGCMTHU841CpDA0xn0fIFMyhMBA4NJbeESOQOiIfcVSq2A4ozNVRp4DMZHMMDOMY0ngSog+jTEDusZjFrGZcWcStk2N79QP9lC0CCK+x0Uxmg8Gw7AUXtnDTSw1HRTxjEsZonwrQgqyIQ181ND8-S3JRkWBDxmiMVM0W0ME5XAipumBEVtGMMM+hHVxLGQi58jXZtN2-BQqmqENh3DSM0RjUN-z6HQfEccV4SnfwgA */
            createMachine({
                context: ctx,
                tsTypes: {} as import("./endpoint.state.typegen").Typegen0,
                schema: {events: {} as EndpointEvent, context: {} as EndpointContext},
                predictableActionArguments: true,
                states: {
                    ready: {
                        on: {
                            authenticateSocket: {
                                target: "performAuth",
                            }, joinChannelRequest: {
                                target: "authoriseSocket",
                            },
                        },
                    }, performAuth: {
                        invoke: {
                            src: "performAuthentication", onDone: [{
                                actions: "addSocketToDB", target: "ready",
                            },], onError: [{
                                actions: "rejectSocketConnection", target: "ready",
                            },],
                        },
                    }, authoriseSocket: {
                        invoke: {
                            src: "authoriseSocketToJoinChannel", onDone: [{
                                actions: "addSocketToChannel", target: "ready",
                            },], onError: [{
                                actions: "rejectChannelRequest", target: "ready",
                            },],
                        },
                    },
                },
                id: endpointId,
                initial: "ready",
            }, {
                actions: {
                    addSocketToDB: (ctx, evt) => this.addSocketToDB(ctx, evt),
                    addSocketToChannel: (ctx, evt) => this.addSocketToChannel(ctx, evt),
                    rejectSocketConnection: (ctx, evt) => EndpointMachine.rejectSocketConnection(ctx, evt),
                    rejectChannelRequest: (ctx, evt) => this.rejectChannelRequest(ctx, evt),
                }, services: {
                    performAuthentication: (ctx, evt) => this.performAuthentication(ctx, evt),
                    authoriseSocketToJoinChannel: (ctx, evt) => this.authoriseSocketToJoinChannel(ctx, evt),
                }
            })

        return interpret(machine).start();
    }

    /**
     * @desc Adds a socket to the database
     * @param ctx - The context of the endpoint machine
     * @param evt - The event that triggered the action
     */
    private addSocketToDB = (ctx: EndpointContext, evt: AuthenticateSocketSuccessEvent) => {
        const {clientId, socket, assigns} = evt.data;
        const subscription = ctx.observable
            .pipe(
                filter((x: any) => x.type === 'SERVER'),
                filter((x: EndpointInternalServerEvent) => {
                    return x.addresses.includes(clientId)
                }),
            ).subscribe(x => this.handleServerEvent(x, socket, clientId))

        socket.addEventListener('close', () => {
            const message: EndpointInternalClientDisconnectedEvent = {
                type: 'CLIENT',
                event: 'CLIENT_DISCONNECTED',
                clientId: clientId,
            }
            ctx.observable.next(message);
            subscription.unsubscribe();
        });

        socket.addEventListener('error', () => {
            const message: EndpointInternalClientDisconnectedEvent = {
                type: 'CLIENT',
                event: 'CLIENT_DISCONNECTED',
                clientId: clientId,
            }
            ctx.observable.next(message);
            subscription.unsubscribe();
        });

        socket.addEventListener('message', (message) => this.handleClientMessage(message.data as string, assigns));
    }

    /**
     * @desc Adds a socket to a channel
     * @param ctx - The context of the endpoint machine
     * @param evt - The event that triggered the action
     */
    private addSocketToChannel(ctx: EndpointContext, evt: JoinChannelRequestSuccessEvent) {
        const channel = ctx.channels.get(evt.data.channelData.channelId);
        if (!channel)
            return this.sendError(evt.data.clientId, 'No such channel exists', true, evt.data.channelData.channelId, evt.data.channelName);

        const client = channel.state.context.presences.get(evt.data.clientId);

        if (!client)
            channel.send({
                type: 'joinRoom',
                clientId: evt.data.clientId,
                data: evt.data
            })

        else
            return this.sendError(
                evt.data.clientId,
                'You have already joined this channel',
                true, evt.data.channelData.channelId,
                evt.data.channelName
            );
    }

    /**
     * @desc Rejects a socket's request to join a channel
     * @param _ctx - The context of the endpoint machine
     * @param evt - The event that triggered the action
     */
    private rejectChannelRequest(_ctx: EndpointContext, evt: JoinChannelRequestErrorEvent) {
        this.sendError(
            evt.data.data.clientId,
            evt.data.errorMessage,
            true, evt.data.data.channelName,
            'END_POINT'
        );
    }

    /**
     * @desc Performs authentication of a socket
     * @param ctx - The context of the endpoint machine
     * @param evt - The event that triggered the action
     */
    private performAuthentication(ctx: EndpointContext, evt: AuthenticateSocketEvent) {
        return BasePromise<AuthenticateSocketSubSuccessEvent, internal.Duplex>((resolve, reject) => {
            const response = this.base.generatePondResponse(async (assigns) => {
                const clientId = this.base.uuid();
                const internalAssigns: InternalAssigns = {...assigns.assign, clientId};
                const server = this.interpreter.state.context.socketServer;
                server.handleUpgrade(evt.data.request, evt.data.socket, evt.data.head, (socket) => {
                    resolve({
                        clientId: clientId,
                        socket: socket,
                        assigns: internalAssigns,
                    })

                    server.emit('connection', socket);
                });

            }, reject, evt.data.socket);

            ctx.handler(evt.data.request, response);
        }, evt.data.socket);
    }

    /**
     * @desc Authorises a socket to join a channel
     * @param ctx - The context of the endpoint machine
     * @param evt - The event that triggered the action
     */
    private authoriseSocketToJoinChannel(ctx: EndpointContext, evt: JoinChannelRequestEvent) {
        return BasePromise<JoinChannelRequestSubSuccessEvent, JoinChannelRequestSubErrorEvent>((resolve, reject) => {
            const {clientId, ...clientAssigns} = evt.data.assigns;
            let channel: ChannelInterpreter | undefined;
            const authorizer = ctx.authorizers.findByKey(path => this.base.compareStringToPattern(evt.data.channelName, path));
            if (!authorizer)
                return reject('No authorizer found', 404, {
                    channelName: evt.data.channelName,
                    assigns: evt.data.assigns,
                    clientId: clientId,
                });

            channel = ctx.channels.find(channel => channel.state.context.channelName === evt.data.channelName)?.value;
            const channelId = channel?.state.context.channelId ?? this.base.uuid();

            if (!channel || channel.status === InterpreterStatus.Stopped)
                channel = new ChannelMachine({
                    channelId: channelId,
                    channelName: evt.data.channelName,
                    channelData: new BaseMap<string, PondPresence>(),
                    verifiers: authorizer.value.events,
                    observable: ctx.observable,
                    presences: new BaseMap<string, PondPresence>(),
                    assigns: new BaseMap<string, PondPresence>(),
                }, this.interpreter).interpreter;

            const request: IncomingJoinMessage = {
                clientId: evt.data.clientId,
                channelId: channel.state.context.channelId,
                channelName: evt.data.channelName,
                clientAssigns: clientAssigns
            }

            const response = this.base.generatePondResponse((assigns) => {
                const internalAssigns: InternalAssigns = {...clientAssigns, ...assigns.assign, clientId};
                const channelData = {...channel!.state.context.channelData, ...assigns.channelData};
                const internalPresence: InternalAssigns = {...assigns.presence, clientId};
                resolve({
                    clientId: clientId,
                    assigns: internalAssigns,
                    presence: internalPresence,
                    channelName: evt.data.channelName,
                    channelData: {...channelData, channelId: channel!.state.context.channelId},
                });

            }, reject, {
                channelName: evt.data.channelName,
                assigns: evt.data.assigns,
                clientId: clientId,
            });

            assign({
                channels: new BaseMap(ctx.channels.set(channel.state.context.channelId, channel)),
            })

            authorizer.value.handler(request, response);
        },  {
            channelName: evt.data.channelName,
            assigns: evt.data.assigns,
            clientId: evt.data.assigns.clientId,
        })
    }

    /**
     * @desc Handles server events and sends them to the client
     * @param evt - The event emitted by the server's observable
     * @param socket - The socket to send the event to
     * @param clientId - The client id of the socket
     */
    private handleServerEvent(evt: EndpointInternalServerEvent, socket: WebSocket, clientId: string) {
        let message: ServerSentMessages;

        switch (evt.event) {
            case "BROADCAST_MESSAGE":
                message = {
                    action: 'MESSAGE',
                    channelId: 'END_POINT',
                    channelName: 'END_POINT',
                    payload: evt.payload,
                }
                break;

            case "PRESENCE_UPDATE":
                message = {
                    action: 'PRESENCE_UPDATE',
                    channelId: evt.channelId,
                    channelName: evt.channelName,
                    payload: evt.payload,
                }
                break;

            case "CHANNEL_ERROR":
                message = {
                    action: 'CHANNEL_ERROR',
                    channelId: evt.channelId,
                    channelName: evt.channelName,
                    payload: {
                        error: evt.reason
                    },
                }
                break;

            case "BROADCAST_MESSAGE_TO_CHANNEL":
                message = {
                    action: 'MESSAGE',
                    channelId: evt.channelId,
                    channelName: evt.channelName,
                    payload: evt.payload,
                }
                break;

            case "CHANNEL_SHUTDOWN":
                message = {
                    action: 'CHANNEL_ERROR',
                    channelId: evt.channelId,
                    channelName: evt.channelName,
                    payload: {
                        error: 'The channel has shutdown unexpectedly',
                    },
                }
                break;

            case "DISCONNECT_CLIENT":
                message = {
                    action: 'DISCONNECT_CLIENT',
                    channelId: 'END_POINT',
                    channelName: 'END_POINT',
                    payload: {
                        message: 'You have been disconnected by the server',
                    }
                }
                break;

            case "DISCONNECT_CLIENT_FROM_CHANNEL":
                message = {
                    action: 'DISCONNECT_CLIENT',
                    channelId: evt.channelId,
                    channelName: evt.channelName,
                    payload: {
                        message: 'You have been kicked from the channel',
                    }
                }
                break;

            case 'SERVER_ERROR':
                message = {
                    action: 'SERVER_ERROR',
                    channelId: 'END_POINT',
                    channelName: 'END_POINT',
                    payload: {
                        error: evt.reason,
                    }
                }
        }

        socket.send(JSON.stringify(message));
        if (evt.event === 'DISCONNECT_CLIENT')
            socket.close();

        else if (evt.event === 'DISCONNECT_CLIENT_FROM_CHANNEL') {
            const channel = this.interpreter.state.context.channels.find(channel => channel.state.context.channelName === evt.channelName)?.value;
            if (!channel)
                return this.sendError(clientId, 'No such channel exists', true, evt.channelId, evt.channelName);

            channel.send({
                type: 'leaveRoom',
                clientId: evt.channelId,
            })
        }
    }

    /**
     * @desc Handles a client's messages to the server
     * @param msg - the message received from the client
     * @param assigns - the assigns of the client
     */
    private handleClientMessage(msg: string, assigns: InternalAssigns) {
        try {
            const data = JSON.parse(msg) as ClientSentMessages;
            const channel = this.interpreter.state.context.channels.find(channel => channel.state.context.channelName === data.channelName)?.value;

            switch (data.action) {
                case 'JOIN_CHANNEL':
                    this.interpreter.send({
                        type: 'joinChannelRequest',
                        data: {
                            channelName: data.channelName,
                            assigns: assigns,
                            clientId: assigns.clientId,
                        }
                    })
                    break;

                case 'LEAVE_CHANNEL':
                    if (!channel)
                        return this.sendError(assigns.clientId, 'No such channel exists', true, assigns.channelId, assigns.channelName);

                    channel.send({
                        type: 'leaveRoom',
                        clientId: assigns.clientId,
                    })
                    break;

                case 'SEND_MESSAGE':
                    if (!channel || data.addresses === undefined || data.addresses.length === 0)
                        return this.sendError(assigns.clientId, 'Invalid arguments provided', true, assigns.channelId, data.channelName);

                    channel.send({
                        type: 'sendMessage',
                        message: {...data.payload, event: data.event},
                        clientId: assigns.clientId,
                        assigns: assigns.presence,
                        presence: assigns.presencd,
                        targets: data.addresses
                    })
                    break;

                case "BROADCAST_MESSAGE":
                    if (!channel)
                        return this.sendError(assigns.clientId, 'No such channel exists', true, assigns.channelId, data.channelName);

                    channel.send({
                        type: 'sendMessage',
                        message: {...data.payload, event: data.event},
                        clientId: assigns.clientId,
                        assigns: assigns.presence,
                        presence: assigns.presencd,
                        targets: 'all'
                    })
                    break;

                case "BROADCAST_FROM":
                    if (!channel)
                        return this.sendError(assigns.clientId, 'No such channel exists', true, assigns.channelId, data.channelName);

                    channel.send({
                        type: 'sendMessage',
                        message: {...data.payload, event: data.event},
                        clientId: assigns.clientId,
                        assigns: assigns.presence,
                        presence: assigns.presencd,
                        targets: 'allExcept'
                    })
                    break;
            }

        } catch (e: any) {
            this.sendError(assigns.clientId, e.message, false, 'END_POINT', 'END_POINT');
        }
    }

    /**
     * @desc Sends an error message to the client
     * @param clientId - The client id of the client to send the error to
     * @param error - The error message to send
     * @param isChannel - Whether the error is a channel error or a client error
     * @param channelId - The id for channel in which the error occurred in
     * @param channelName - The name for channel in which the error occurred in
     * @private
     */
    private sendError(clientId: string, error: string, isChannel: boolean, channelId: string, channelName: string) {
        if (isChannel) {
            const message: EndpointInternalChannelErrorEvent = {
                type: 'SERVER',
                event: 'CHANNEL_ERROR',
                channelId: channelId,
                channelName: channelName,
                reason: error,
                addresses: [clientId],
            }

            this.interpreter.state.context.observable.next(message);

        } else {
            const message: EndpointInternalServerErrorEvent = {
                type: 'SERVER',
                event: 'SERVER_ERROR',
                addresses: [clientId],
                reason: error,
            }

            this.interpreter.state.context.observable.next(message);
        }
    }
}

