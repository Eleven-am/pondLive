/// <reference types="node" />
import { IncomingMessage, Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { ChannelMessageEventVerifiers, OutBoundChannelEvent, Presence } from "./channels";
export declare type default_t<T = any> = {
    [p: string]: T;
};
export declare type JoinRoomPromise = {
    roomName: string;
    clientId: string;
    roomData: default_t;
    assigns: default_t;
    presence: default_t;
    socket: WebSocket;
    endpoint: string;
    verifiers: ChannelMessageEventVerifiers;
};
declare type AuthenticateRoom = {
    type: 'requestToJoinRoom';
    clientId: string;
    socket: WebSocket;
    endpoint: string;
    assigns: default_t;
    roomToJoin: string;
};
declare type JoinRoomAssigns = {
    assigns?: default_t;
    roomData?: default_t;
    presence?: default_t;
};
declare type GlobalAssigns = default_t;
declare type IncomingJoinRoomRequest = Omit<AuthenticateRoom, 'type' | 'socket'>;
export declare type NewIncomingRequest<T, V = default_t> = {
    request: T;
    accept: (assigns?: V) => void;
    decline: (message: string) => void;
};
interface PondEndpoint {
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
     * room.on('croak', ({assigns, roomData, assign}) => {
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
interface PondChannel {
    /**
     * @desc Adds an event listener to the channel
     * @param event - the event to listen for
     * @param callback - the callback to call when the event is triggered
     */
    on: (event: string | RegExp, callback: (outBound: OutBoundChannelEvent) => void) => void;
    /**
     * @desc Broadcasts an event to all clients in the room
     * @param roomId - the id of the room to broadcast to
     * @param event - the event to broadcast
     * @param data - the data to broadcast
     */
    broadcast: (roomId: string, event: string, data: default_t) => void;
    /**
     * @desc Broadcasts an event to all clients in the room except the clientId provided
     * @param roomId - the id of the room to broadcast to
     * @param clientId - the clientId to exclude from the broadcast
     * @param event - the event to broadcast
     * @param data - the data to broadcast
     */
    broadcastFrom: (roomId: string, clientId: string, event: string, data: default_t) => void;
    /**
     * @desc Sends an event to the clientId provided
     * @param roomId - the name of the room to broadcast to
     * @param clientId - the clientId to send the event to
     * @param event - the event to broadcast
     * @param data - the data to broadcast
     */
    send: (roomId: string, clientId: string, event: string, data: default_t) => void;
    /**
     * @desc Gets the list of clients in the channel
     * @param roomId - the id of the room to get the clients from
     */
    getPresenceList: <T>(roomId: string) => Presence<T>[];
    /**
     * @desc Gets the metadata of the channel
     * @param roomId - the id of the room to get the metadata from
     */
    getRoomData: (roomId: string) => default_t;
    /**
     * @desc Disconnects the client from the channel
     * @param roomId - the id of the room to disconnect from
     * @param clientId - the clientId to disconnect
     */
    disconnect: (roomId: string, clientId: string) => void;
}
export declare class PondSocket {
    private readonly _server;
    private readonly _wss;
    private readonly _base;
    private _paths;
    private _interpreter;
    constructor(server?: Server, wss?: WebSocketServer);
    /**
     * @desc declines an authenticated socket from the pond
     * @param event - the event that is being handled
     * @private
     */
    private static rejectSocketConnection;
    /**
     * @desc rejects a socket connection to the room provided
     * @param event - the event that is being handled
     * @private
     */
    private static sendErrorMessage;
    /**
     * @desc compares string to string | regex
     * @param string - the string to compare to the pattern
     * @param pattern - the pattern to compare to the string
     */
    private static compareStringToPattern;
    /**
     * @desc Broadcasts a message to the given sockets
     * @param sockets - the sockets to broadcast to
     * @param message - the message to broadcast
     */
    private static broadcast;
    /**
     * @desc Compare a pattern to another pattern
     * @param pattern - the pattern to compare to
     * @param other - the other pattern to compare to
     */
    private static comparePatternToPattern;
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
    /**
     * @desc Accepts a new socket join request to the room provided using the handler function to authorise the socket
     * @param endpoint - the endpoint to accept the socket on
     * @param pattern - the pattern to accept || can also be a regex
     * @param handler - the handler function to authenticate the socket
     * @private
     */
    private createRoom;
    /**
     * @desc initializes the pond socket service
     * @private
     */
    private init;
    /**
     * @desc generate an accept function for the socket connection
     * @param obj - the object that is being accepted
     * @param resolve - the resolve function of the promise
     * @param endpoint - the endpoint of the socket connection
     * @param pattern - the pattern of the endpoint for the socket connection
     * @private
     */
    private generateAccept;
    /**
     * @desc authenticate a socket connection
     * @param _context - the context of the state machine
     * @param event - the event that is being handled
     * @private
     */
    private authenticateSocket;
    /**
     * @desc adds a newly authenticated socket to the pond
     * @param context - the context of the state machine
     * @param event - the event that is being handled
     * @private
     */
    private static addSocketToDB;
    /**
     * @desc authorises a socket connection to the room provided
     * @param _context - the context of the state machine
     * @param event - the event that is being handled
     * @private
     */
    private authenticateRoom;
    /**
     * @desc adds a newly authenticated socket to the room provided
     * @param context - the context of the state machine
     * @param event - the event that is being handled
     * @private
     */
    private joinRoom;
    /**
     * @desc shuts down the pond and closes all sockets
     * @param _context - the context of the state machine
     * @param _event - the event that is being handled
     * @private
     */
    private shutDownServer;
    /**
     * @desc starts the pond server
     * @param _context - the context of the state machine
     * @private
     */
    private setupServer;
    /**
     * @desc Makes sure that every client is still connected to the pond
     * @param server - WebSocket server
     */
    private pingClients;
    /**
     * @desc Returns all the sockets that are currently connected to the pond
     * @private
     */
    private getAllSockets;
    /**
     * @desc Returns all the sockets connected to the specified endpoint
     * @param endpoint - the endpoint to search for
     */
    private getSocketsByEndpoint;
    /**
     * @desc Gets a specific socket by its client id if it is connected to this endpoint
     * @param socketId - the client id of the socket to get
     * @param endpoint - the endpoint to search for
     * @private
     */
    private getSocketById;
    /**
     * @desc Gets a specific channel by its id
     * @param channelId - the id of the channel to get
     */
    private getChannelById;
}
export {};
