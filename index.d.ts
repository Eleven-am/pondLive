import {IncomingMessage, Server} from "http";
import {WebSocket, WebSocketServer} from "ws";

type ChannelMessageBody = {
    message: default_t & { event: string };
    clientId: string;
    assigns: default_t
    targets: string[] | 'all' | 'allExcept';
}

declare type NewIncomingRequest<T, V = default_t> = {
    request: T;
    accept: (assigns?: V) => void;
    decline: (message: string) => void;
};

declare type Presence<T> = default_t<T> & { id: string };

declare type InternalPondChannel = {
    getPresenceList: <T>() => Presence<T>[];
    getRoomData: () => default_t;
    disconnect: (clientId: string) => void;
    broadcast: (event: string, payload: default_t) => void;
    broadcastFrom: (clientId: string, event: string, payload: default_t) => void;
    send: (clientId: string, event: string, payload: default_t) => void;
}

declare type LocalAssigns = {
    assigns?: default_t;
    presence?: default_t;
}

declare type OutBoundChannelEvent = NewIncomingRequest<ChannelMessageBody, LocalAssigns> & {
    room: InternalPondChannel;
};

declare type GlobalAssigns = default_t;

declare type default_t<T = any> = {
    [p: string]: T;
};

declare type AuthenticateRoom = {
    type: 'requestToJoinRoom';
    clientId: string;
    socket: WebSocket;
    endpoint: string;
    assigns: default_t;
    roomToJoin: string;
    roomData: default_t;
};

declare type JoinRoomAssigns = {
    assigns?: default_t;
    roomData?: default_t;
    presence?: default_t;
};

declare type IncomingJoinRoomRequest = Omit<AuthenticateRoom, 'type'>;

declare class PondEndpoint {
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
    /**
     * @desc Broadcasts a message to all sockets connected through the endpoint
     * @param event - the event to broadcast
     * @param message - the message to broadcast
     */
    broadcast: (event: string, message: default_t) => void;
    /**
     * @desc Sends a message to a specific socket
     * @param socketId - the socketId to send the message to
     * @param event - the event to broadcast
     * @param message - the message to broadcast
     */
    send: (socketId: string, event: string, message: default_t) => void;
    /**
     * @desc Closes a specific socket if it is connected to the endpoint
     * @param socketId - the socketId to close
     * @param code - the code to send to the socket
     */
    close: (socketId: string, code?: number) => void;
}

declare class PondChannel {
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

export declare class PondSocket {
    constructor(server?: Server, wss?: WebSocketServer);
    /**
     * @desc Specifies the port to listen on
     * @param port - the port to listen on
     * @param callback - the callback to call when the server is listening
     */
    listen(port: number, callback?: (port?: number) => void): Server;
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
    createEndpoint(pattern: string | RegExp, handler: ((request: NewIncomingRequest<IncomingMessage, GlobalAssigns>) => void)): PondEndpoint;
}
