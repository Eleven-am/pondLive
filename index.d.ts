import {IncomingMessage, Server} from "http";
import {WebSocketServer} from "ws";

export type default_t = {
    [key: string]: any;
}

export type InternalAssigns = default_t & { clientId: string };

export type RemoveClientId<T> = Omit<T, "clientId">;

export type PondAssigns = RemoveClientId<InternalAssigns>;
export type PondPresence = RemoveClientId<InternalAssigns>;
export type PondChannelData = RemoveClientId<InternalAssigns>;

export interface PondResponseAssigns {
    assign?: PondAssigns;
    presence?: PondPresence;
    channelData?: PondChannelData;
}

export interface IncomingJoinMessage {
    clientId: string;
    channelId: string;
    channelName: string;
    clientAssigns: PondAssigns;
}

export interface IncomingChannelMessage {
    event: string;
    channelId: string;
    channelName: string;
    message: default_t;
    client: {
        clientId: string;
        clientAssigns: PondAssigns;
        clientPresence: PondPresence;
    }
}

export interface PondResponse {
    accept: (assigns?: PondResponseAssigns) => void;
    reject: (message?: string, statusCode?: number) => void;
}

declare class InternalPondChannel {
    /**
     * @desc Gets the current presence of the channel
     */
    getPresence(): PondPresence[];

    /**
     * @desc Gets the current channel data
     */
    getChannelData(): PondChannelData;

    /**
     * @desc Modifies the presence state of a client on the channel
     * @param clientId - The clientId to modify the presence of
     * @param assigns - The assigns to modify the presence with
     */
    modifyPresence(clientId: string, assigns: PondResponseAssigns): void;

    /**
     * @desc Closes the channel from the given clientId
     * @param clientId - The clientId to close the channel from, can be an array of clientIds
     */
    closeFromChannel(clientId: string | string[]): void;

    /**
     * @desc Broadcasts a message to the channel
     * @param event - The event to send the message to
     * @param message - The message to send
     */
    broadcast(event: string, message: default_t): void;

    /**
     * @desc Sends a message to the channel
     * @param clientId - The clientId to send the message to, can be an array of clientIds
     * @param event - The event to send the message to
     * @param message - The message to send
     */
    send(clientId: string | string[], event: string, message: default_t): void;
}

declare class PondChannel {

    /**
     * @desc A listener for a channel event
     * @param event - The event to listen for, can be a regex
     * @param callback - The callback to call when the event is received
     */
    on(event: string | RegExp, callback: (req: IncomingChannelMessage, res: PondResponse, room: InternalPondChannel) => void): void;

    /**
     * @desc Gets a channel's data by id from the endpoint.
     * @param channelId - The id of the channel to get the data of.
     */
    getChannelData(channelId: string): PondChannelData;

    /**
     * @desc Gets a channel's presence by id from the endpoint.
     * @param channelId - The id of the channel to get the presence of.
     */
    getPresence(channelId: string): PondPresence[];

    /**
     * @desc Sends a message to a channel in the endpoint.
     * @param channelId - The id of the channel to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    broadcastToChannel(channelId: string, event: string, message: default_t): void;

    /**
     * @desc Closes a client connection to a channel in the endpoint.
     * @param channelId - The id of the channel to close the connection to.
     * @param clientId - The id of the client to close the connection to.
     */
    closeFromChannel(channelId: string, clientId: string): void;

    /**
     * @desc Modify the presence of a client in a channel on the endpoint.
     * @param channelId - The id of the channel to modify the presence of.
     * @param clientId - The id of the client to modify the presence of.
     * @param assigns - The assigns to modify the presence with.
     */
    modifyPresence(channelId: string, clientId: string, assigns: PondResponseAssigns): void;
}

declare class PondEndpoint {
    /**
     * @desc Broadcasts a message to all clients in the endpoint.
     * @param event - The event to broadcast.
     * @param message - The message to broadcast.
     */
    broadcast(event: string, message: default_t): void;

    /**
     * @desc Disconnects a client from the endpoint.
     * @param clientId - The id of the client to disconnect.
     */
    close(clientId: string): void;

    /**
     * @desc Accepts a new socket join request to the room provided using the handler function to authorise the socket
     * @param path - the pattern to accept || can also be a regex
     * @param handler - the handler function to authenticate the socket
     *
     * @example
     * const channel = endpoint.createChannel('channel:*', (req, res) => {
     *   const isAdmin = req.assigns.admin;
     *   if (!isAdmin)
     *      return res.decline('You are not an admin');
     *
     *   res.accept({assigns: {admin: true, joinedDate: new Date()}, presence: {state: online}, channelData: {private: true}});
     * });
     *
     * channel.on('ping', (req, res, channel) => {
     *     const users = channel.getPresence();
     *     res.assign({pingDate: new Date(), users: users.length});
     * })
     */
    createChannel(path: string | RegExp, handler: (req: IncomingJoinMessage, res: PondResponse) => void): PondChannel;

    /**
     * @desc Gets a channel by id from the endpoint.
     * @param channelId - The id of the channel to get.
     */
    getChannel(channelId: string): InternalPondChannel | null;

    /**
     * @desc Sends a message to a client on the endpoint.
     * @param clientId - The id of the client to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    send(clientId: string | string[], event: string, message: default_t): void;
}

export default class PondServer {
    constructor(server?: Server, socketServer?: WebSocketServer);

    /**
     * @desc Specifies the port to listen on
     * @param port - the port to listen on
     * @param callback - the callback to call when the server is listening
     */
    listen(port: number, callback: (port?: number) => void): Server;

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
    createEndpoint(path: string | RegExp, handler: (req: IncomingMessage, res: PondResponse) => void): PondEndpoint;
}
