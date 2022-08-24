/// <reference types="node" />
import { IncomingMessage, Server } from "http";
import { Interpreter } from "xstate";
import { default_t, IncomingChannelMessage, IncomingJoinMessage, InternalAssigns, PondChannelData, PondResponse } from "../index";
import { InternalPassSocketToEndPointEvent } from "./server.state";
import internal from "stream";
import { BaseMap, RejectPromise } from "./utils";
import { Subject } from "rxjs";
import { WebSocket, WebSocketServer } from "ws";
import { ChannelInterpreter } from "./channel.state";
import { InternalPondChannel } from "./channel";
declare type GetHandlerEvent = {
    type: "getHandler";
    data: {
        endpoint: string;
        handler: (req: IncomingMessage, res: PondResponse) => void;
    };
};
declare type AuthenticateSocketEvent = {
    type: "authenticateSocket";
    data: InternalPassSocketToEndPointEvent;
};
declare type AuthenticateSocketSuccessEvent = {
    type: 'done.invoke.(machine).performAuth:invocation[0]';
    data: AuthenticateSocketSubSuccessEvent;
};
declare type AuthenticateSocketSubSuccessEvent = {
    clientId: string;
    socket: WebSocket;
    assigns: InternalAssigns;
};
declare type AuthenticateSocketErrorEvent = {
    type: 'error.platform.(machine).performAuth:invocation[0]';
    data: RejectPromise<internal.Duplex>;
};
declare type JoinChannelRequestEvent = {
    type: "joinChannelRequest";
    data: {
        channelName: string;
        clientId: string;
        assigns: InternalAssigns;
    };
};
declare type JoinChannelRequestSuccessEvent = {
    type: 'done.invoke.(machine).authoriseSocket:invocation[0]';
    data: JoinChannelRequestSubSuccessEvent;
};
export declare type JoinChannelRequestSubSuccessEvent = {
    channelName: string;
    clientId: string;
    assigns: InternalAssigns;
    presence: InternalAssigns;
    channelData: PondChannelData & {
        channelId: string;
    };
};
declare type JoinChannelRequestErrorEvent = {
    type: 'error.platform.(machine).authoriseSocket:invocation[0]';
    data: RejectPromise<JoinChannelRequestSubErrorEvent>;
};
declare type JoinChannelRequestSubErrorEvent = {
    channelName: string;
    clientId: string;
    assigns: InternalAssigns;
};
export declare type EndpointEvent = GetHandlerEvent | AuthenticateSocketEvent | JoinChannelRequestEvent | AuthenticateSocketSuccessEvent | AuthenticateSocketErrorEvent | JoinChannelRequestSuccessEvent | JoinChannelRequestErrorEvent;
export declare type EndpointContext = {
    handler: (req: IncomingMessage, res: PondResponse) => void;
    socketServer: WebSocketServer;
    observable: Subject<EndpointInternalEvents>;
    server: Server;
    authorizers: BaseMap<string | RegExp, {
        handler: (req: IncomingJoinMessage, res: PondResponse) => void;
        events: BaseMap<string | RegExp, (req: IncomingChannelMessage, res: PondResponse, room: InternalPondChannel) => void>;
    }>;
    channels: BaseMap<string, ChannelInterpreter>;
};
export declare type EndpointInterpreter = Interpreter<EndpointContext, any, EndpointEvent, {
    value: any;
    context: EndpointContext;
}, any>;
export declare type EndpointInternalClientDisconnectedEvent = {
    type: 'CLIENT';
    event: 'CLIENT_DISCONNECTED';
    clientId: string;
};
declare type EndpointInternalClientEmittedEvents = {
    type: 'CLIENT';
    event: 'JOIN_CHANNEL' | 'LEAVE_CHANNEL';
    clientId: string;
    channelName: string;
    payload: default_t;
};
declare type EndpointInternalClientBroadCastMessageEvents = {
    type: 'CLIENT';
    event: 'BROADCAST_MESSAGE' | 'BROADCAST_FROM';
    subEvent: string;
    clientId: string;
    channelName: string;
    payload: default_t;
};
declare type EndpointInternalClientSendMessageEvents = {
    type: 'CLIENT';
    event: 'SEND_MESSAGE';
    subEvent: string;
    clientId: string;
    channelName: string;
    payload: default_t;
    addresses: string[];
};
declare type EndpointInternalChannelEvent = {
    type: 'SERVER';
    event: 'PRESENCE_UPDATE' | 'DISCONNECT_CLIENT_FROM_CHANNEL';
    channelId: string;
    channelName: string;
    addresses: string[];
    payload: default_t;
};
declare type EndpointInternalChannelMessageEvent = {
    type: 'SERVER';
    event: 'BROADCAST_MESSAGE_TO_CHANNEL';
    channelId: string;
    subEvent: string;
    channelName: string;
    addresses: string[];
    payload: default_t;
};
export declare type EndpointInternalChannelErrorEvent = {
    type: 'SERVER';
    event: 'CHANNEL_SHUTDOWN' | 'CHANNEL_ERROR';
    channelId: string;
    channelName: string;
    reason: string;
    addresses: string[];
};
export declare type EndpointInternalServerErrorEvent = {
    type: 'SERVER';
    event: 'SERVER_ERROR';
    reason: string;
    addresses: string[];
};
declare type EndpointDisconnectEvent = {
    type: 'SERVER';
    event: 'DISCONNECT_CLIENT';
    addresses: string[];
};
declare type EndpointMessageEvent = {
    type: 'SERVER';
    event: 'BROADCAST_MESSAGE' | 'DISCONNECT_CLIENT';
    subEvent: string;
    addresses: string[];
    payload: default_t;
};
export declare type EndpointInternalClientEvent = EndpointInternalClientEmittedEvents | EndpointInternalClientDisconnectedEvent | EndpointInternalClientBroadCastMessageEvents | EndpointInternalClientSendMessageEvents;
export declare type EndpointInternalServerEvent = EndpointInternalChannelEvent | EndpointInternalChannelMessageEvent | EndpointMessageEvent | EndpointDisconnectEvent | EndpointInternalServerErrorEvent | EndpointInternalChannelErrorEvent;
export declare type EndpointInternalEvents = EndpointInternalClientEvent | EndpointInternalServerEvent;
export declare class EndpointMachine {
    readonly interpreter: EndpointInterpreter;
    private readonly base;
    constructor(ctx: EndpointContext, endpointId: string);
    /**
     * @desc Rejects a socket connection
     * @param _ctx - The context of the endpoint machine
     * @param evt - The event that triggered the action
     */
    private static rejectSocketConnection;
    /**
     * @desc Start the endpoint machine.
     * @param ctx - The context to start the machine with.
     * @param endpointId - The id of the endpoint.
     * @private
     */
    private start;
    /**
     * @desc Adds a socket to the database
     * @param ctx - The context of the endpoint machine
     * @param evt - The event that triggered the action
     */
    private addSocketToDB;
    /**
     * @desc Adds a socket to a channel
     * @param ctx - The context of the endpoint machine
     * @param evt - The event that triggered the action
     */
    private addSocketToChannel;
    /**
     * @desc Rejects a socket's request to join a channel
     * @param _ctx - The context of the endpoint machine
     * @param evt - The event that triggered the action
     */
    private rejectChannelRequest;
    /**
     * @desc Performs authentication of a socket
     * @param ctx - The context of the endpoint machine
     * @param evt - The event that triggered the action
     */
    private performAuthentication;
    /**
     * @desc Authorises a socket to join a channel
     * @param ctx - The context of the endpoint machine
     * @param evt - The event that triggered the action
     */
    private authoriseSocketToJoinChannel;
    /**
     * @desc Handles server events and sends them to the client
     * @param evt - The event emitted by the server's observable
     * @param socket - The socket to send the event to
     * @param clientId - The client id of the socket
     */
    private handleServerEvent;
    /**
     * @desc Handles a client's messages to the server
     * @param msg - the message received from the client
     * @param assigns - the assigns of the client
     */
    private handleClientMessage;
    /**
     * @desc Sends an error message to the client
     * @param clientId - The client id of the client to send the error to
     * @param error - The error message to send
     * @param isChannel - Whether the error is a channel error or a client error
     * @param channelId - The id for channel in which the error occurred in
     * @param channelName - The name for channel in which the error occurred in
     * @private
     */
    private sendError;
}
export {};
