import {IncomingMessage, Server} from "http";
import {WebSocketServer} from "ws";
import {Channel} from "./declarations/server";

declare type PondPath = string | RegExp;

declare type PondChanelInfo = {
    channelId: string;
    channelName: string;
    channelData: PondChannelData;
    presence: InternalPondPresence[];
}

declare type default_t = {
    [key: string]: any;
}

declare type InternalPondPresence = PondPresence & { id: string };

declare type InternalAssigns = default_t & { clientId: string };

declare type RemoveClientId<T> = Omit<T, "clientId">;

declare type PondAssigns = RemoveClientId<InternalAssigns>;
declare type PondPresence = RemoveClientId<InternalAssigns>;
declare type PondChannelData = RemoveClientId<InternalAssigns>;

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
    }
}

interface PondResponse {
    accept: (assigns?: PondResponseAssigns) => void;
    reject: (message?: string, statusCode?: number) => void;
}

declare class InternalPondChannel {

    /**
     * @desc Gets the current presence of the channel
     */
    public get presence(): InternalPondPresence[];

    /**
     * @desc Gets the current channel data
     */
    public get channelData(): PondChannelData;

    /**
     * @desc Modifies the presence state of a client on the channel
     * @param clientId - The clientId to modify the presence of
     * @param assigns - The assigns to modify the presence with
     */
    public modifyPresence(clientId: string, assigns: PondResponseAssigns): void;

    /**
     * @desc Closes the channel from the given clientId
     * @param clientId - The clientId to close the channel from, can be an array of clientIds
     */
    public closeFromChannel(clientId: string | string[]): void;

    /**
     * @desc Broadcasts a message to the channel
     * @param event - The event to send the message to
     * @param message - The message to send
     */
    public broadcast(event: string, message: default_t): void;

    /**
     * @desc Sends a message to the channel
     * @param clientId - The clientId to send the message to, can be an array of clientIds
     * @param event - The event to send the message to
     * @param message - The message to send
     */
    public send(clientId: string | string[], event: string, message: default_t): void;
}

declare class PondChannel {

    /**
     * @desc A listener for a channel event
     * @param event - The event to listen for, can be a regex
     * @param callback - The callback to call when the event is received
     */
    public public on(event: PondPath, callback: (req: IncomingChannelMessage, res: PondResponse, room: InternalPondChannel) => void): void;

    /**
     * @desc Gets a channel's data by id from the endpoint.
     * @param channelId - The id of the channel to get the data of.
     */
    public public getChannelData(channelId: string): PondChannelData;

    /**
     * @desc Gets a channel's presence by id from the endpoint.
     * @param channelId - The id of the channel to get the presence of.
     */
    public public getPresence(channelId: string): InternalPondPresence[];

    /**
     * @desc Sends a message to a channel in the endpoint.
     * @param channelId - The id of the channel to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    public public broadcastToChannel(channelId: string, event: string, message: default_t): void;

    /**
     * @desc Closes a client connection to a channel in the endpoint.
     * @param channelId - The id of the channel to close the connection to.
     * @param clientId - The id of the client to close the connection to.
     */
    public public closeFromChannel(channelId: string, clientId: string): void;

    /**
     * @desc Modify the presence of a client in a channel on the endpoint.
     * @param channelId - The id of the channel to modify the presence of.
     * @param clientId - The id of the client to modify the presence of.
     * @param assigns - The assigns to modify the presence with.
     */
    public public modifyPresence(channelId: string, clientId: string, assigns: PondResponseAssigns): void;
}

declare class PondEndpoint {

    /**
     * @desc Broadcasts a message to all clients in the endpoint.
     * @param event - The event to broadcast.
     * @param message - The message to broadcast.
     */
    public broadcast(event: string, message: default_t): void;

    /**
     * @desc Disconnects a client from the endpoint.
     * @param clientId - The id of the client to disconnect.
     */
    public close(clientId: string): void;

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
    public createChannel(path: PondPath, handler: (req: IncomingJoinMessage, res: PondResponse) => void): PondChannel;

    /**
     * @desc Gets a channel by id from the endpoint.
     * @param channelId - The id of the channel to get.
     */
    public getChannel(channelId: string): InternalPondChannel | null;

    /**
     * @desc lists all the channels in the endpoint
     */
    public listChannels(): PondChanelInfo[];

    /**
     * @desc Sends a message to a client on the endpoint.
     * @param clientId - The id of the client to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    public send(clientId: string | string[], event: string, message: default_t): void;

    /**
     * @desc Closes a client connection to the endpoint.
     * @param clientId - The id of the client to close the connection to.
     */
    public closeConnection(clientId: string): void;
}

export default class PondServer {

    constructor(server?: Server, socketServer?: WebSocketServer);

    /**
     * @desc Specifies the port to listen on
     * @param port - the port to listen on
     * @param callback - the callback to call when the server is listening
     */
    public listen(port: number, callback: (port?: number) => void): Server;

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
    public createEndpoint(path: string | RegExp, handler: (req: IncomingMessage, res: PondResponse) => void): PondEndpoint;
}
