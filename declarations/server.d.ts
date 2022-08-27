/// <reference types="node" />
import { WebSocket, WebSocketServer } from "ws";
import { BaseMap, RejectPromise } from "./utils";
import { IncomingMessage, Server } from "http";
import { InternalPondChannel, PondEndpoint, ServerMessage } from "./channel";
import { Subject } from "rxjs";
import { InternalPondPresence } from "../index";
declare type default_t = {
    [key: string]: any;
};
declare type PondAssigns = default_t;
declare type PondPresence = default_t;
declare type PondChannelData = default_t;
declare type MessageType = 'BROADCAST' | 'BROADCAST_FROM' | 'SEND_MESSAGE_TO_USER';
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
    };
}
interface PondResponse {
    accept: (assigns?: PondResponseAssigns) => void;
    reject: (message?: string, statusCode?: number) => void;
}
export declare type PondPath = string | RegExp;
declare type SocketCache = {
    endpointId: string;
    socket: WebSocket;
    clientId: string;
    assigns: PondAssigns;
};
export declare type EndpointCache = {
    path: PondPath;
    channels: BaseMap<string, Channel>;
    subject: Subject<ServerMessage>;
    handler: (req: IncomingMessage, res: PondResponse) => void;
    socketCache: BaseMap<string, SocketCache>;
    authorizers: BaseMap<PondPath, {
        handler: (req: IncomingJoinMessage, res: PondResponse) => void;
        events: BaseMap<string | RegExp, (req: IncomingChannelMessage, res: PondResponse, channel: InternalPondChannel) => void>;
    }>;
};
declare type NewUser = {
    clientId: string;
    assigns: PondAssigns;
    presence: PondPresence;
    channelData: PondChannelData;
};
export declare class Channel {
    readonly channelId: string;
    readonly channelName: string;
    private data;
    private readonly base;
    private readonly subject;
    private readonly assigns;
    private readonly presence;
    private verifiers;
    constructor(channelName: string, subject: Subject<ServerMessage>, verifiers: BaseMap<PondPath, (req: IncomingChannelMessage, res: PondResponse, channel: InternalPondChannel) => void>);
    /**
     * @desc Adds a new user to the channel
     * @param user - The user to add to the channel
     */
    set newUser(user: NewUser);
    /**
     * @desc Gets the list of presence in the channel
     */
    get presenceList(): InternalPondPresence[];
    /**
     * @desc Gets the data of the channel
     */
    get channelData(): PondChannelData;
    /**
     * @desc Gets the list of users in the channel
     * @private
     */
    get clientIds(): string[];
    /**
     * @desc Sends a message to the clients addressed in the channel
     * @param message - The message to send
     */
    sendToClients(message: ServerMessage): void;
    /**
     * @desc Removes a user from the channel
     * @param clientId - The clientId of the user to remove
     */
    removeUser(clientId: string): void;
    /**
     * @desc Updates the state of a user in the channel
     * @param clientId - The clientId of the user to update
     * @param presence - The new presence of the user
     * @param assigns - The new assigns of the user
     */
    updateUser(clientId: string, presence: PondPresence, assigns: PondAssigns): void;
    /**
     * @desc Authorises the message before sending it through the channel
     * @param event - The event to authorise
     * @param message - The message to authorise\
     * @param clientId - The clientId of the user sending the message
     * @param type - The type of message to authorise
     * @param addresses - The addresses of the message
     */
    authorise(event: string, message: default_t, clientId: string, type: MessageType, addresses?: string[]): Promise<void>;
    /**
     * @desc Sends an error to the client
     * @param error - The error to send
     */
    sendError(error: RejectPromise<string>): void;
    /**
     * @desc Gets a user's data from the channel
     * @param clientId - The clientId of the user to get data for
     * @private
     */
    private getUser;
    /**
     * @desc Listens to the client disconnected Message
     */
    private listenToClientDisconnected;
}
export declare class PondSocket {
    private readonly base;
    private readonly server;
    private readonly socketServer;
    private readonly endpoints;
    constructor(server?: Server, socketServer?: WebSocketServer);
    /**
     * @desc Rejects the client's connection
     * @param error - Reason for rejection
     */
    private static rejectClient;
    /**
     * @desc Sends a message to a client
     * @param socket - The socket to send the message to
     * @param message - The message to send
     */
    private static sendMessage;
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
    createEndpoint(path: PondPath, handler: (req: IncomingMessage, res: PondResponse) => void): PondEndpoint;
    /**
     * @desc Specifies the port to listen on
     * @param port - the port to listen on
     * @param callback - the callback to call when the server is listening
     */
    listen(port: number, callback: (port?: number) => void): Server;
    /**
     * @desc Gets a channel and performs an action on it
     * @param endpointId - The id of the endpoint the channel is on
     * @param channelName - The id of the channel to perform the action on
     * @param action - The action to perform on the channel
     * @private
     */
    private channelAction;
    /**
     * @desc Makes sure that every client is still connected to the pond
     * @param server - WebSocket server
     */
    private pingClients;
    /**
     * @desc Initializes the server
     */
    private init;
    /**
     * @desc Leaves a channel
     * @param endpointId - The endpointId of the endpoint to leave
     * @param clientId - The clientId of the client to leave
     * @param channelName - The name of the channel to leave
     */
    private leaveChannel;
    /**
     * @desc Authenticates the client by checking if there is a matching endpoint
     * @param request - Incoming request
     * @param socket - Incoming socket
     * @param head - Incoming head
     */
    private authenticateClient;
    /**
     * @desc Receives as socketCache and adds listeners to it
     * @param cache - Socket cache to add listeners to
     */
    private addSocketListeners;
    /**
     * @desc Authorises the client to join a channel
     * @param clientId - The id of the client making the request
     * @param channelName - The name of the channel the client wishes to join
     * @param endpointId - The id of the endpoint the client is connected to
     */
    private authoriseClient;
    /**
     * @desc Handles a message sent from a client
     * @param cache - The socket cache of the client
     * @param message - The message to handle
     * @private
     */
    private readMessage;
    /**
     * @desc Deals with a message sent from a client
     * @param cache - The socket cache of the client
     * @param message - The message to handle
     */
    private handleMessage;
    /**
     * @desc Handles a message sent by the server and sends it to the client
     * @param socket - The socket to send the message to
     * @param message - The message to send
     * @private
     */
    private static handleServerMessage;
}
export {};
