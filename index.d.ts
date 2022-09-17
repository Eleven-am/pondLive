import {IncomingHttpHeaders, IncomingMessage, Server as HTTPServer} from "http";
import {WebSocket, WebSocketServer} from "ws";
import internal from "stream";

export enum ServerActions {
    ERROR = 'ERROR',
    MESSAGE = 'MESSAGE',
    PRESENCE = 'PRESENCE',
    CLOSE = 'CLOSE',
}

export type ServerMessage = {
    action: ServerActions;
    channelName: string;
    payload: default_t;
    event: string;
}

interface RejectPromise<T> {
    errorMessage: string
    errorCode: number;
    data: T;
}

type PondMessage = default_t;
type PondAssigns = default_t;
type PondPresence = default_t;
type PondChannelData = default_t;

type default_t<T = any> = {
    [key: string]: T;
}

type PondPath = string | RegExp;

interface IncomingConnection {
    clientId: string;
    params: default_t<string>;
    query: default_t<string>;
    headers: IncomingHttpHeaders;
    address: string;
}

interface IncomingJoinMessage {
    clientId: string;
    channelName: string;
    clientAssigns: PondAssigns;
    joinParams: default_t;
    params: default_t<string>;
    query: default_t<string>;
}

interface IncomingChannelMessage {
    channelName: string;
    message: default_t;
    client: {
        clientId: string;
        clientAssigns: PondAssigns;
        clientPresence: PondPresence;
    },
    params: default_t<string>;
    query: default_t<string>;
}

interface PondResponseAssigns {
    assigns?: PondAssigns;
    presence?: PondPresence;
    channelData?: PondChannelData;
}

interface Socket {
    onerror: (err: Error) => void;
    onclose: (code: number, reason: string) => void;
    send: (data: string) => void;
    close: (code: number, reason: string) => void;
    onmessage: (event: { data: string }) => void;
}

type ClientCache = {
    clientId: string
    socket: Socket;
    assigns: PondAssigns;
}

interface SocketCache extends ClientCache {
    socket: WebSocket;
}

interface NewUser {
    client: Omit<SocketCache, 'assigns' | 'socket'>;
    assigns: PondAssigns;
    presence: PondPresence;
    channelData: PondChannelData;
}

enum ResponsePicker {
    POND = "POND",
    CHANNEL = "CHANNEL"
}

enum PondSenders {
    SERVER = "SERVER",
    ENDPOINT = "ENDPOINT",
    POND_CHANNEL = "POND_CHANNEL"
}

interface Resolver {
    params: default_t<string>;
    query: default_t<string>;
    address: string;
}

interface ChannelInfo {
    name: string;
    channelData: PondChannelData;
    presence: PondPresence[];
    assigns: Record<string, PondAssigns>;
}

interface ChannelEvent extends ServerMessage {
    clientId: string | PondSenders;
    clientAssigns: PondAssigns;
    clientPresence: PondPresence;
    channel: Channel;
}

type Anything<A = any> = A | undefined | void | null;

type EndpointHandler = (req: IncomingConnection, res: PondResponse<ResponsePicker.POND>, endpoint: Endpoint) => void;

type ChannelHandler = (req: IncomingJoinMessage, res: PondResponse, channel: Channel) => void;

type Subscriber = (event: ChannelEvent) => Anything<RejectPromise<{
    event: string;
    channelName: string;
}> | boolean>;

type SendResponse<T = ResponsePicker.CHANNEL> = T extends ResponsePicker.CHANNEL ? Required<PondResponseAssigns> : T extends ResponsePicker.POND ? Required<Omit<PondResponseAssigns, 'presence' | 'channelData'>> : never;

export declare class PondResponse<T extends ResponsePicker = ResponsePicker.CHANNEL> {

    /**
     * @desc Emits a direct message to the client
     * @param event - the event name
     * @param payload - the payload to send
     * @param assigns - the data to assign to the client
     */
    send(event: string, payload: PondMessage, assigns?: Partial<SendResponse<T>>): void;

    /**
     * @desc Accepts the request and optionally assigns data to the client
     * @param assigns - the data to assign to the client
     */
    accept(assigns?: Partial<SendResponse<T>>): void;

    /**
     * @desc Rejects the request with the given error message
     * @param message - the error message
     * @param errorCode - the error code
     */
    reject(message?: string, errorCode?: number): void;
}

export declare class Subscription {
    /**
     * @desc Unsubscribe from the broadcast
     */
    unsubscribe: () => void;
}

export declare class Channel {
    readonly name: string;

    /**
     * @desc Returns the channel info
     */
    get info(): ChannelInfo;

    /**
     * @desc Gets the channel's data
     */
    get data(): PondChannelData;

    /**
     * @desc Sets the channel's data
     * @param data
     */
    set data(data: PondChannelData);

    /**
     * @desc Gets the channel's presence
     */
    get presence(): PondPresence[];

    /**
     * @desc Gets the channel's assigns
     */
    get assigns(): Record<string, PondAssigns>;

    /**
     * @desc Adds a new user to the channel
     * @param user - The user to add to the channel
     */
    addUser(user: NewUser): void;

    /**
     * @desc Gets a user's information
     * @param clientId - The clientId of the user
     */
    getUserInfo(clientId: string): {
        presence: PondPresence;
        assigns: PondAssigns;
    } | null;

    /**
     * @desc Removes a user or group of users from the channel
     * @param clientIds - The clientIds of the users to remove
     */
    removeUser(clientIds: string | string[]): void;

    /**
     * @desc Broadcasts a message to all users in the channel
     * @param event - The event name
     * @param message - The message to send
     * @param sender - The sender of the message
     */
    broadcast(event: string, message: PondMessage, sender?: PondSenders | string): void;

    /**
     * @desc Broadcasts a message to all users in the channel except the sender
     * @param event - The event name
     * @param message - The message to send
     * @param clientId - The client id of the sender
     */
    broadcastFrom(event: string, message: PondMessage, clientId: string): void;

    /**
     * @desc Sends a message to a specific user or group of users
     * @param event - The event name
     * @param clientId - The client id of the user to send the message to
     * @param message - The message to send
     * @param sender - The client id of the sender
     */
    sendTo(event: string, message: PondMessage, sender: string, clientId: string | string[]): void;

    /**
     * @desc Subscribes to a channel event
     */
    subscribe(callback: (message: ChannelEvent) => Anything<RejectPromise<{
        event: string;
        channelName: string;
    }> | boolean>): Subscription;

    /**
     * @desc Updates the state of a user in the channel
     * @param clientId - The clientId of the user to update
     * @param presence - The new presence of the user
     * @param assigns - The new assigns of the user
     */
    updateUser(clientId: string, presence: PondPresence, assigns: PondAssigns): void;

    /**
     * @desc Subscribes to a channel event
     * @param clientId - The client id of the user to send the message to
     * @param callback - The callback to call when a message is received
     */
    subscribeToMessages(clientId: string, callback: (message: ServerMessage) => void): Subscription;
}

export declare class PondChannel {
    readonly path: PondPath;

    /**
     * @desc A listener for a channel event
     * @param event - The event to listen for, can be a regex
     * @param callback - The callback to call when the event is received
     */
    on(event: PondPath, callback: (req: IncomingChannelMessage, res: PondResponse, room: Channel) => void): void;

    /**
     * @desc Add new user to channel
     * @param user - The user to add to the channel
     * @param channelName - The name of the channel
     * @param joinParams - The params to join the channel with
     */
    addUser(user: SocketCache, channelName: string, joinParams: default_t): Promise<void>;

    /**
     * @desc Sends a message to a channel in the endpoint.
     * @param channelName - The name of the channel to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    broadcastToChannel(channelName: string, event: string, message: PondMessage): void;

    /**
     * @desc Closes a client connection to a channel in the endpoint.
     * @param channelName - The name of the channel to close the connection to.
     * @param clientId - The id of the client to close the connection to.
     */
    closeFromChannel(channelName: string, clientId: string | string[]): void;

    /**
     * @desc Modify the presence of a client in a channel on the endpoint.
     * @param channelName - The name of the channel to modify the presence of.
     * @param clientId - The id of the client to modify the presence of.
     * @param assigns - The assigns to modify the presence with.
     */
    modifyPresence(channelName: string, clientId: string, assigns: PondResponseAssigns): void;

    /**
     * @desc Gets the information of the channel
     * @param channelName - The name of the channel to get the information of.
     */
    getChannelInfo(channelName: string): ChannelInfo;

    /**
     * @desc Sends a message to the channel
     * @param channelName - The name of the channel to send the message to.
     * @param clientId - The clientId to send the message to, can be an array of clientIds
     * @param event - The event to send the message to
     * @param message - The message to send
     */
    send(channelName: string, clientId: string | string[], event: string, message: default_t): void;

    /**
     * @desc Gets a list of all the channels in the endpoint.
     */
    get info(): ChannelInfo[];
    /**
     * @desc Searches for a channel in the endpoint.
     * @param query - The query to search for.
     */
    findChannel(query: (channel: Channel) => boolean): Channel | null;

    /**
     * @desc Subscribes a function to a channel in the endpoint.
     * @param channelName - The name of the channel to subscribe to.
     * @param callback - The function to subscribe to the channel.
     */
    subscribe(channelName: string, callback: Subscriber): Subscription;

    /**
     * @desc removes a user from all channels
     * @param clientId - The id of the client to remove
     */
    removeUser(clientId: string): void;
}

export declare class Endpoint {
    readonly path: PondPath;

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
    createChannel(path: PondPath, handler: ChannelHandler): PondChannel;

    /**
     * @desc Authenticates the client to the endpoint
     * @param request - Incoming request
     * @param socket - Incoming socket
     * @param head - Incoming head
     * @param data - Incoming the data resolved from the handler
     */
    authoriseConnection(request: IncomingMessage, socket: internal.Duplex, head: Buffer, data: Resolver): Promise<void>;

    /**
     * @desc Closes a client connection to the endpoint.
     * @param clientId - The id of the client to close the connection to.
     */
    closeConnection(clientId: string): void;

    /**
     * @desc Sends a message to a client on the endpoint.
     * @param clientId - The id of the client to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    send(clientId: string | string[], event: string, message: default_t): void;

    /**
     * @desc lists all the channels in the endpoint
     */
    listChannels(): ChannelInfo[];

    /**
     * @desc lists all the clients in the endpoint
     */
    listConnections(): WebSocket[];

    /**
     * @desc Broadcasts a message to all clients in the endpoint.
     * @param event - The event to broadcast.
     * @param message - The message to broadcast.
     */
    broadcast(event: string, message: default_t): void;

    /**
     * @desc Shuts down the endpoint
     */
    close(): void;
}

export default class Server {

    constructor(server?: HTTPServer, socketServer?: WebSocketServer);

    /**
     * @desc Specifies the port to listen on
     * @param port - the port to listen on
     * @param callback - the callback to call when the server is listening
     */
    listen(port: number, callback: (port?: number) => void): HTTPServer;

    /**
     * @desc Accepts a new socket upgrade request on the provided endpoint using the handler function to authenticate the socket
     * @param path - the pattern to accept || can also be a regex
     * @param handler - the handler function to authenticate the socket
     *
     * @example
     * const endpoint = pond.createEndpoint('/api/socket', (req, res) => {
     *    const { query } = parse(req.url || '');
     *    const { token } = query;
     *    if (!token)
     *       return res.reject('No token provided');
     *    res.accept({
     *       assign: {
     *           token
     *       }
     *    });
     * })
     */
    createEndpoint(path: PondPath, handler: EndpointHandler): Endpoint;
}
