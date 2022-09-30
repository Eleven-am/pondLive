import {IncomingHttpHeaders, IncomingMessage, Server, ServerResponse} from "server/http";
import {WebSocket, WebSocketServer} from "ws";
import {ClientActions, PondBaseActions, PondSenders, ResponsePicker, ServerActions} from "../../server/enums";
import internal from "stream";
import {HtmlSafeString} from "../../http";
import {NextFunction} from "../../server/http";

export type default_t<T = any> = Record<string, any>

export type PondPath = string | RegExp;

export type PondAssigns = default_t;
export type PondPresence = default_t;
export type PondChannelData = default_t;
export type PondMessage = default_t;

export interface PondResponseAssigns {
    assigns?: PondAssigns;
    presence?: PondPresence;
    channelData?: PondChannelData;
}

export interface IncomingConnection {
    clientId: string;
    params: default_t<string>;
    query: default_t<string>;
    headers: IncomingHttpHeaders;
    address: string;
}

export interface IncomingJoinMessage {
    clientId: string;
    channelName: string;
    clientAssigns: PondAssigns;
    joinParams: default_t;
    params: default_t<string>;
    query: default_t<string>;
}

export interface IncomingChannelMessage {
    channelName: string;
    event: string;
    message: default_t;
    client: {
        clientId: string;
        clientAssigns: PondAssigns;
        clientPresence: PondPresence;
    },
    params: default_t<string>;
    query: default_t<string>;
}

export interface RejectPromise<T> {
    errorMessage: string
    errorCode: number;
    data: T;
}

export type ClientMessage = {
    action: ClientActions;
    channelName: string;
    event: string;
    payload: default_t;
    addresses?: string[];
}

export type ServerMessage = {
    action: ServerActions;
    channelName: string;
    payload: default_t;
    event: string;
}

/***********************************************************/
/*       This section refers to the PondResponse file      */
/***********************************************************/

export interface ResponseResolver<T = ResponsePicker.CHANNEL> {
    assigns: SendResponse<T>
    message?: { event: string, payload: PondMessage };
    error?: {
        errorMessage: string;
        errorCode: number;
    }
}

/***********************************************************/
/*        This section refers to the Broadcast file        */
/***********************************************************/

interface Socket {
    onerror: (err: Error) => void;
    onclose: (code: number, reason: string) => void;
    send: (data: string) => void;
    close: (code: number, reason: string) => void;
    onmessage: (event: { data: string }) => void;
}

export type ClientCache = {
    clientId: string
    socket: Socket;
    assigns: PondAssigns;
}


/***********************************************************/
/*         This section refers to the channel file         */
/***********************************************************/

export interface NewUser {
    client: Omit<SocketCache, 'assigns' | 'socket'>;
    assigns: PondAssigns;
    presence: PondPresence;
    channelData: PondChannelData;
}

/***********************************************************/
/*          This section refers to the server file         */
/***********************************************************/

export interface SocketCache extends ClientCache {
    socket: WebSocket;
}

export interface Constructor<T> {
    new(...args: any[]): T;
}

/***********************************************************/
/*        This section refers to the utils folder          */
/***********************************************************/

export interface Resolver {
    params: default_t<string>;
    query: default_t<string>;
    address: string;
}

export interface EventRequest {
    params: default_t<string>;
    query: default_t<string>;
    nextPath: string;
    address: string;
}

export class BaseClass {
    /**
     * @desc creates an uuid v4 string
     */
    uuid(): string;

    /**
     * @desc Generates an 8 character long random string
     */
    nanoId(): string;

    /**
     * @desc Checks if the given object is empty
     * @param obj - the object to check
     */
    isObjectEmpty(obj: object): boolean;

    /**
     * @desc Generates a pond request resolver object
     * @param path - the path to resolve
     * @param address - the address to resolve
     */
    generateEventRequest(path: PondPath, address: string): Resolver | null;

    /**
     * @desc Matches a string to a pattern
     * @param path - the path to match
     * @param address - the address to match
     */
    getLiveRequest(path: string, address: string): EventRequest | null;

    /**
     * @desc Compares if two objects are equal
     * @param obj1 - the first object
     * @param obj2 - the second object
     */
    areEqual<T>(obj1: T, obj2: T): boolean;

    /**
     * @desc decodes a string using its secret key
     * @param salt - the secret key
     * @param encoded - the encoded string
     */
    decrypt<S>(salt: string, encoded: string): S | null;

    /**
     * @desc encodes an object using into a string using its secret key
     * @param salt - the secret key
     * @param text - the object to encode
     */
    encrypt(salt: string, text: any): string;
}

export type Anything<A = any> = A | undefined | void | null;

export declare class Subscription {
    unsubscribe: () => void;
}

export class PondError<T> implements RejectPromise<T> {
    errorMessage: string;
    errorCode: number;
    data: T;

    constructor(errorMessage: string, errorCode: number, data: T);
}

export function BasePromise<T, V>(data: V, callback: (resolve: (value: T) => void, reject: (((errorMessage: string, errorCode?: number) => void))) => void): Promise<T>;

export class PondDocument<T> {
    get id(): string;

    get doc(): T;

    /**
     * @desc Removes the document from the collection
     */
    removeDoc(): T | undefined;

    /**
     * @desc Updates the document in the collection
     * @param value - the new value of the document
     */
    updateDoc(value: T): void;
}

export class PondBase<T> {
    constructor();

    /**
     * @desc Get the number of documents
     */
    get size(): number;

    /**
     * @desc Get a document by key
     * @param key - The key of the document
     */
    get(key: string): PondDocument<T> | null;

    /**
     * @desc Set a document to the database
     * @param value - The value of the document
     */
    set(value: T): PondDocument<T>;

    /**
     * @desc Update a document by key
     * @param key - The key of the document
     * @param value - The new value of the document
     */
    update(key: string, value: T): PondDocument<T>;

    /**
     * @desc Create a pond document
     * @param creator - The creator function of the pond document
     */
    createDocument(creator: (doc: Readonly<PondDocument<undefined>>) => T): PondDocument<T>;

    /**
     * @desc Merge the pond with another pond
     * @param pond - The pond to merge with
     */
    merge(pond: PondBase<T>): PondBase<T>;

    /**
     * @desc Generate a generator of all documents
     */
    generate(): Generator<T>;

    /**
     * @desc Query documents by a query function
     * @param query - The query function
     */
    query(query: (doc: T) => boolean): PondDocument<T>[];

    /**
     * @desc Query documents by a query function on the document's key
     * @param query - The query function
     */
    queryById(query: (id: string) => boolean): PondDocument<T>[];

    /**
     * @desc Query documents by a list of keys
     * @param keys - The keys of the documents
     */
    queryByKeys(keys: string[]): PondDocument<T>[];

    /**
     * @desc Reduces the pond to a single value
     * @param reducer - The reducer function
     * @param initialValue - The initial value of the reducer
     */
    reduce<U>(reducer: (accumulator: U, currentValue: T, currentIndex: number) => U, initialValue: U): U;

    /**
     * @desc Find a document by a query function
     * @param query - The query function
     */
    find(query: (doc: T) => boolean): PondDocument<T> | null;

    /**
     * @desc Map the pond to a new array
     * @param mapper - The mapper function
     */
    map<U>(mapper: (doc: T) => U): U[];

    /**
     * @desc Clear the pond
     */
    clear(): void;

    /**
     * @desc Subscribe to change on all documents
     * @param handler - The handler function of the event
     */
    subscribe(handler: (docs: T[], change: T | null, action: PondBaseActions) => void): Subscription;

    /**
     * @desc Get all the documents in an array
     */
    toArray(): PondDocument<T>[];
}

type SendResponse<T = ResponsePicker.CHANNEL> = T extends ResponsePicker.CHANNEL ? Required<PondResponseAssigns> : T extends ResponsePicker.POND ? Required<Omit<PondResponseAssigns, 'presence' | 'channelData'>> : never;

export class PondResponse<T extends ResponsePicker = ResponsePicker.CHANNEL> {
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

    /**
     * @desc Executes the response callback
     * @param assigns - the data to assign to the client
     * @private
     */
}

export declare class Broadcast<T, A> {
    /**
     * @desc Subscribe to the broadcast
     * @param handler - The handler to call when the broadcast is published
     */
    subscribe(handler: (data: T) => Anything<A>): Subscription;

    /**
     * @desc Publish to the broadcast
     * @param data - The data to publish
     */
    publish(data: T): Anything<A>;
}

export declare class Subject<T, A> extends Broadcast<T, A> {
    constructor(value: T);

    /**
     * @desc Get the current value of the subject
     */
    get value(): T | undefined;

    /**
     * @desc Subscribe to the subject
     */
    subscribe(handler: (data: T) => Anything<A>): Subscription;

    /**
     * @desc Publish to the subject
     */
    publish(data: T): Anything<A>;
}

/***********************************************************/
/*        This section refers to the socket folder         */
/***********************************************************/

export interface ChannelInfo {
    name: string;
    channelData: PondChannelData;
    presence: PondPresence[];
    assigns: Record<string, PondAssigns>;
}

export interface ChannelEvent extends ServerMessage {
    clientId: string | PondSenders;
    clientAssigns: PondAssigns;
    clientPresence: PondPresence;
    channel: Channel;
}

export declare class Channel extends BaseClass {
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
     * @desc Checks if a user exists in the channel
     * @param clientId - The clientId of the user
     */
    hasUser(clientId: string): boolean;

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

    /**
     * @desc creates a pond response object, useful for sending a response to a client
     * @param clientId - The client id of the user to send the message to
     */
    createPondResponse(clientId: string): PondResponse;
}

export declare type ChannelHandler = (req: IncomingJoinMessage, res: PondResponse, channel: Channel) => void;

export declare type Subscriber = (event: ChannelEvent) => Anything<RejectPromise<{
    event: string;
    channelName: string;
}> | boolean>;

export declare class PondChannel extends BaseClass {
    /**
     * @desc Gets a list of all the channels in the endpoint.
     */
    get info(): ChannelInfo[];

    /**
     * @desc A listener for a channel event
     * @param event - The event to listen for, can be a regex
     * @param callback - The callback to call when the event is received
     */
    on(event: PondPath, callback: (req: IncomingChannelMessage, res: PondResponse, channel: Channel) => void): Subscription;

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

export declare type EndpointHandler = (req: IncomingConnection, res: PondResponse<ResponsePicker.POND>, endpoint: Endpoint) => void;

export declare class Endpoint extends BaseClass {
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
     * @desc Shuts down the endpoint.
     */
    close(): void;
}

export declare class PondSocket extends BaseClass {
    constructor(server?: HTTPServer, socketServer?: WebSocketServer);

    /**
     * @desc Specifies the port to listen on
     * @param port - the port to listen on
     * @param callback - the callback to call when the server is listening
     */
    listen(port: number, callback: (port?: number) => void): HTTPServer;

    /**
     * @desc adds a middleware to the server
     * @param middleware - the middleware to add
     */
    useOnUpgrade(middleware: (req: IncomingMessage, socket: internal.Duplex, head: Buffer, next: NextFunction) => void): void;

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

/***********************************************************/
/*        This section refers to the Live folder         */
/***********************************************************/

export interface Route {
    path: string;
    Component: Constructor<LiveComponent>;
}

export interface MountContext {
    path: string;
    params: Record<string, string>;
    query: Record<string, string>;
}

export interface RenderContext<LiveContext> {
    context: Readonly<LiveContext>;
    renderRoutes: () => HtmlSafeString;
}

export declare type CSSOutput = {
    string: HtmlSafeString;
    classes: Record<string, string>;
};

export declare type CSSGenerator = (statics: TemplateStringsArray, ...dynamics: unknown[]) => CSSOutput;

export interface LiveComponent<LiveContext = any, LiveEvent = any, LiveInfo = any> {
    routes: Route[];

    /**
     * @desc The manage Styles function is called when the component is mounted and is used to generate the styles for the component
     * @param context - The context of the component
     * @param css - The css generator function
     */
    manageStyles?(context: LiveContext, css: CSSGenerator): CSSOutput;

    /**
     * @desc The mount function is called when the component is mounted and is used to initialise the component
     * @param context - The context of the component
     * @param socket - The socket of the connecting client
     * @param router - The router for this instance of the connection
     */
    mount?(context: MountContext, socket: LiveSocket<LiveContext>, router: LiveRouter): void | Promise<void>;

    /**
     * @desc The onRender function is called after the component is rendered and the socket has upgraded
     * @param context - The context of the component
     * @param socket - The socket of the connecting client
     * @param router - The router for this instance of the connection
     */
    onRendered?(context: Readonly<LiveContext>, socket: LiveSocket<LiveContext>, router: LiveRouter): void | Promise<void>;

    /**
     * @desc The onEvent function is called when the component receives an event from the client
     * @param event - The event received from the client
     * @param context - The context of the component
     * @param socket - The socket of the connecting client
     * @param router - The router for this instance of the connection
     */
    onEvent?(event: LiveEvent, context: Readonly<LiveContext>, socket: LiveSocket<LiveContext>, router: LiveRouter): void | Promise<void>;

    /**
     * @desc The onInfo function is called when the component receives an info event from the server
     * @param info - The info event received from the server
     * @param context - The context of the component
     * @param socket - The socket of the connecting client
     * @param router - The router for this instance of the connection
     */
    onInfo?(info: LiveInfo, context: Readonly<LiveContext>, socket: LiveSocket<LiveContext>, router: LiveRouter): void | Promise<void>;

    /**
     * @desc onUnmount is called when the component is unmounted
     * @param context - The context of the component
     */
    onUnmount?(context: Readonly<LiveContext>): void | Promise<void>;

    /**
     * @desc The render function is called when the component is rendered and is used to generate the html for the component
     * @param context - The context of the component
     * @param classes - The classes generated by the manageStyles function
     */
    render(context: RenderContext<LiveContext>, classes: Record<string, string>): HtmlSafeString;
}

export function LiveFactory<LiveContext extends Object, LiveEvent, LiveInfo>(props: LiveComponent<LiveContext, LiveEvent, LiveInfo>): Constructor<LiveComponent<LiveContext, LiveEvent, LiveInfo>>;

export declare type RouterHeaders = {
    pageTitle: string | undefined;
    flashMessage: string | undefined;
};

export declare class LiveRouter {
    /**
     * @desc Sets the page title for the current page
     * @param title - The title to set
     */
    set pageTitle(title: string);

    /**
     * @desc Sets the flash message for the current page
     * @param message - The message to set
     */
    set flashMessage(message: string);

    /**
     * @desc Pushes the client to the specified path
     * @param path - The path to redirect to
     */
    push(path: string): Promise<void> | void;

    /**
     * @desc Redirects the client to the specified path
     * @param path - The path to redirect to
     */
    redirect(path: string): Promise<void> | void;

    /**
     * @desc Replaces the client's current path with the specified path
     * @param path - The path to replace with
     */
    replace(path: string): Promise<void> | void;
}

export declare class LiveSocket<LiveContext extends Object> {
    readonly clientId: string;

    /**
     * @desc The context of the socket
     */
    get context(): LiveContext;

    /**
     * @desc Gets a specific channel from the pond, if it exists
     * @param name - The name of the channel
     */
    getChannel(name: string): Channel | null;

    /**
     * @desc Assigns a value to the socket's context
     * @param assigns - The values to assign
     */
    assign(assigns: Partial<LiveContext>): void;

    /**
     * @desc Assigns a value to a channel in the pond
     * @param name - The name of the channel
     * @param assigns - The values to assign
     */
    assignToChannel<AssignData extends PondChannelData>(name: string, assigns: AssignData): void;

    /**
     * @desc Broadcasts an event to a channel in the pond
     * @param channel - The name of the channel
     * @param event - The event to broadcast
     * @param data - The data to broadcast
     */
    broadcast<BroadcastData>(channel: string, event: string, data: BroadcastData): void;

    /**
     * @desc Get's the assigned value from a channel in the pond
     * @param name - The name of the channel
     */
    getChannelData<AssignData>(name: string): AssignData | null;

    /**
     * @desc Subscribes to a channel in the pond
     * @param name - The name of the channel
     */
    subscribe(name: string): void;

    /**
     * @desc Unsubscribes from a channel in the pond
     * @param name - The name of the channel
     */
    unsubscribe(name: string): void;
}

interface ServerProps {
    secret?: string;
    cookie?: string;
    pondPath?: string;
    pondSocket?: PondSocket;
    htmlPath?: string;
}

/**
 * @desc Generate a liveServer from an array of LiveComponent\ routes
 * @param routes - The routes to generate the server from
 * @param server - The HTTP server to generate the liveServer from
 * @param chain - The middleware chain to use, could be an express app.use chain
 * @param props - The properties to use when generating the server
 */
export declare const GenerateLiveServer: (routes: Route[], server: Server, chain: Chain, props?: ServerProps) => PondSocket;

/***********************************************************/
/*          This section refers to the http folder         */
/***********************************************************/

export declare type NextFunction = () => void;

export declare type MiddleWareFunction = (request: IncomingMessage, response: ServerResponse, next: NextFunction) => void;

export declare type Chain = {
    use: (middleware: MiddleWareFunction) => void;
};

export declare type AuthenticatedRequest = IncomingMessage & {
    clientId?: string;
    token?: string;
};

declare type IAuthenticateRequest = (secret: string, cookie: string) => (req: AuthenticatedRequest, res: ServerResponse, next: NextFunction) => void;

declare type IAuthSocketRequest = (secret: string, cookie: string) => (req: AuthenticatedRequest, socket: internal.Duplex, head: Buffer, next: NextFunction) => void;

export declare const AuthenticateRequest: IAuthenticateRequest;

export declare const AuthenticateUpgrade: IAuthSocketRequest;

declare function parseCookies(headers: IncomingHttpHeaders): Record<string, string>;

declare function setCookie(res: ServerResponse, name: string, value: string, options?: any): void;

declare function deleteCookie(res: ServerResponse, name: string): void;

export {parseCookies, setCookie, deleteCookie};

export declare function html(statics: TemplateStringsArray, ...dynamics: unknown[]): HtmlSafeString;

export declare function BodyParserMiddleware(): MiddleWareFunction;

export declare function JsonBodyParserMiddleware(): MiddleWareFunction;

export declare function CorsMiddleware(): MiddleWareFunction;

declare type IFileRouter = (absolutePath: string) => (request: IncomingMessage, response: ServerResponse, next: NextFunction) => void;

export declare const FileRouter: IFileRouter;

export interface PondGetRequest extends IncomingMessage {
    params: Record<string, string>;
    query: Record<string, string>;
    address: string;
    clientId?: string;
}

export interface PondPostRequest extends IncomingMessage {
    params: Record<string, string>;
    query: Record<string, string>;
    address: string;
    clientId?: string;
    body: Record<string, any>;
}

export interface PondPutRequest extends IncomingMessage {
    params: Record<string, string>;
    query: Record<string, string>;
    address: string;
    clientId?: string;
    body: Record<string, any>;
}

export interface PondDeleteRequest extends IncomingMessage {
    params: Record<string, string>;
    query: Record<string, string>;
    address: string;
    clientId?: string;
}

export interface PondPatchRequest extends IncomingMessage {
    params: Record<string, string>;
    query: Record<string, string>;
    address: string;
    clientId?: string;
    body: Record<string, any>;
}

export declare class PondServer {
    constructor();

    listen(port: number, callback: () => void): void;

    use(middleware: (req: IncomingMessage, res: ServerResponse, next: NextFunction) => void): void;

    get(path: PondPath, callback: (req: PondGetRequest, res: ServerResponse) => void): void;

    post(path: PondPath, callback: (req: PondPostRequest, res: ServerResponse) => void): void;

    put(path: PondPath, callback: (req: PondPutRequest, res: ServerResponse) => void): void;

    delete(path: PondPath, callback: (req: PondDeleteRequest, res: ServerResponse) => void): void;

    patch(path: PondPath, callback: (req: PondPatchRequest, res: ServerResponse) => void): void;

    upgrade(path: PondPath, handler: EndpointHandler): void;

    useStatic(path: string): void;

    useAuthenticator(secret: string, cookieName?: string): void;

    useBodyParser(): void;

    useCors(): void;

    usePondLive(routes: Route[], htmlPath?: string): void;
}
