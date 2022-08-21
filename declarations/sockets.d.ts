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
declare type AddSocketPromise = {
    clientId: string;
    socket: WebSocket;
    assigns: default_t;
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
export declare type GlobalSocketService = {
    authenticateRoom: {
        data: JoinRoomPromise;
    };
    setupServer: {
        data: void;
    };
    authenticateSocket: {
        data: AddSocketPromise;
    };
};
declare type JoinRoomAssigns = {
    assigns?: default_t;
    roomData?: default_t;
    presence?: default_t;
};
declare type GlobalAssigns = default_t;
declare type IncomingJoinRoomRequest = Omit<AuthenticateRoom, 'type'>;
export declare type NewIncomingRequest<T, V = default_t> = {
    request: T;
    accept: (assigns?: V) => void;
    decline: (message: string) => void;
};
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
    createEndpoint(pattern: string | RegExp, handler: ((request: NewIncomingRequest<IncomingMessage, GlobalAssigns>) => void)): PonEndpoint;
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
    private addSocketToDB;
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
}
export {};
