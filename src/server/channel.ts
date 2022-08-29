import {BaseMap} from "./utils";
import {Channel, EndpointCache, PondPath} from "./server";

type default_t = {
    [key: string]: any;
}

type InternalPondPresence = PondPresence & { id: string };

type InternalAssigns = default_t & { clientId: string };

type RemoveClientId<T> = Omit<T, "clientId">;

type PondAssigns = RemoveClientId<InternalAssigns>;
export type PondPresence = RemoveClientId<InternalAssigns>;
type PondChannelData = RemoveClientId<InternalAssigns>;

export interface PondResponseAssigns {
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

export interface PondResponse {
    accept: (assigns?: PondResponseAssigns) => void;
    reject: (message?: string, statusCode?: number) => void;
}

type ServerActions =
    'PRESENCE_BRIEF'
    | 'MESSAGE'
    | 'CHANNEL_ERROR'
    | 'KICKED_FROM_CHANNEL'
    | 'CLOSED_FROM_SERVER'
    | 'CHANNEL_DESTROY'
    | 'CLIENT_DISCONNECTED';

export type PondChanelInfo = {
    channelId: string;
    channelName: string;
    channelData: PondChannelData;
    presence: InternalPondPresence[];
}

export type ServerMessage = {
    action: ServerActions;
    channelName: string;
    event: string;
    clientId: string;
    payload: default_t;
    addresses: string[];
}

export class InternalPondChannel {
    private readonly channel: Channel;

    constructor(channel: Channel) {
        this.channel = channel;
    }

    /**
     * @desc Gets the current presence of the channel
     */
    get presence(): InternalPondPresence[] {
        return this.channel.presenceList;
    }

    /**
     * @desc Gets the current channel data
     */
    get channelData(): PondChannelData {
        return this.channel.channelData;
    }

    /**
     * @desc Modifies the presence state of a client on the channel
     * @param clientId - The clientId to modify the presence of
     * @param assigns - The assigns to modify the presence with
     */
    public modifyPresence(clientId: string, assigns: PondResponseAssigns): void {
        this.channel.updateUser(clientId, assigns.presence || {}, assigns.assign || {});
    }

    /**
     * @desc Closes the channel from the given clientId
     * @param clientId - The clientId to close the channel from, can be an array of clientIds
     */
    public closeFromChannel(clientId: string | string[]): void {
        const clientIds = Array.isArray(clientId) ? clientId : [clientId];
        clientIds.forEach(id => this.channel.removeUser(id));
        const newMessage: ServerMessage = {
            action: 'KICKED_FROM_CHANNEL',
            channelName: this.channel.channelName,
            event: '', payload: {},
            addresses: clientIds,
            clientId: this.channel.channelId,
        }

        this.channel.sendToClients(newMessage);
    }

    /**
     * @desc Broadcasts a message to the channel
     * @param event - The event to send the message to
     * @param message - The message to send
     */
    public broadcast(event: string, message: default_t): void {
        const clients = this.channel.clientIds;

        const newMessage: ServerMessage = {
            action: 'MESSAGE', clientId: 'SERVER',
            channelName: this.channel.channelName,
            event, payload: message, addresses: clients
        }

        this.channel.sendToClients(newMessage);
    }

    /**
     * @desc Sends a message to the channel
     * @param clientId - The clientId to send the message to, can be an array of clientIds
     * @param event - The event to send the message to
     * @param message - The message to send
     */
    public send(clientId: string | string[], event: string, message: default_t): void {
        const clients = Array.isArray(clientId) ? clientId : [clientId];

        const newMessage: ServerMessage = {
            action: 'MESSAGE', clientId: 'SERVER',
            channelName: this.channel.channelName,
            event, payload: message, addresses: clients
        }

        this.channel.sendToClients(newMessage);
    }
}

export class PondChannel {
    private channels: BaseMap<string, Channel>;
    private readonly events: BaseMap<PondPath, (req: IncomingChannelMessage, res: PondResponse, room: InternalPondChannel) => void>

    constructor(channels: BaseMap<string, Channel>, events: BaseMap<PondPath, (req: IncomingChannelMessage, res: PondResponse, room: InternalPondChannel) => void>) {
        this.channels = channels;
        this.events = events;
    }

    /**
     * @desc A listener for a channel event
     * @param event - The event to listen for, can be a regex
     * @param callback - The callback to call when the event is received
     */
    public on(event: PondPath, callback: (req: IncomingChannelMessage, res: PondResponse, room: InternalPondChannel) => void): void {
        this.events.set(event, callback);
    }

    /**
     * @desc Gets a channel's data by id from the endpoint.
     * @param channelId - The id of the channel to get the data of.
     */
    public getChannelData(channelId: string): PondChannelData {
        const channel = this.getPrivateChannel(channelId);
        if (channel)
            return channel.channelData;

        return {};
    }

    /**
     * @desc Gets a channel's presence by id from the endpoint.
     * @param channelId - The id of the channel to get the presence of.
     */
    public getPresence(channelId: string): InternalPondPresence[] {
        const channel = this.getPrivateChannel(channelId);
        if (channel)
            return channel.presence;
        return [];
    }

    /**
     * @desc Sends a message to a channel in the endpoint.
     * @param channelId - The id of the channel to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    public broadcastToChannel(channelId: string, event: string, message: default_t): void {
        const channel = this.getPrivateChannel(channelId);
        if (channel)
            channel.broadcast(event, message);
    }

    /**
     * @desc Closes a client connection to a channel in the endpoint.
     * @param channelId - The id of the channel to close the connection to.
     * @param clientId - The id of the client to close the connection to.
     */
    public closeFromChannel(channelId: string, clientId: string): void {
        const channel = this.getPrivateChannel(channelId);
        if (channel)
            channel.closeFromChannel(clientId);
    }

    /**
     * @desc Modify the presence of a client in a channel on the endpoint.
     * @param channelId - The id of the channel to modify the presence of.
     * @param clientId - The id of the client to modify the presence of.
     * @param assigns - The assigns to modify the presence with.
     */
    public modifyPresence(channelId: string, clientId: string, assigns: PondResponseAssigns): void {
        const channel = this.getPrivateChannel(channelId);
        if (channel)
            channel.modifyPresence(clientId, assigns);
    }

    /**
     * @desc Gets a channel by id from the endpoint.
     * @param channelId - The id of the channel to get.
     * @private
     */
    private getPrivateChannel(channelId: string): InternalPondChannel | null {
        const channel = this.channels.get(channelId) || null;
        if (!channel)
            return null;

        return new InternalPondChannel(channel);
    }
}

export class PondEndpoint {
    private readonly endpoint: EndpointCache;

    constructor(endpoint: EndpointCache) {
        this.endpoint = endpoint;
        this.listen();
    }

    /**
     * @desc Broadcasts a message to all clients in the endpoint.
     * @param event - The event to broadcast.
     * @param message - The message to broadcast.
     */
    public broadcast(event: string, message: default_t): void {
        const sockets = this.endpoint.socketCache.keys();
        const newMessage: ServerMessage = {
            action: 'MESSAGE', clientId: 'SERVER',
            channelName: 'SERVER', event, payload: message,
            addresses: Array.from(sockets)
        }
        this.endpoint.subject.next(newMessage);
    }

    /**
     * @desc Disconnects a client from the endpoint.
     * @param clientId - The id of the client to disconnect.
     */
    public close(clientId: string): void {
        const client = this.endpoint.socketCache.get(clientId);
        if (client)
            client.socket.close();
    }

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
    public createChannel(path: PondPath, handler: (req: IncomingJoinMessage, res: PondResponse) => void): PondChannel {
        const events = new BaseMap<string | RegExp, (req: IncomingChannelMessage, res: PondResponse, room: InternalPondChannel) => void>();

        this.endpoint.authorizers.set(path, {
            handler: handler,
            events: events
        });

        return new PondChannel(this.endpoint.channels, events);
    }

    /**
     * @desc Gets a channel by id from the endpoint.
     * @param channelId - The id of the channel to get.
     */
    public getChannel(channelId: string): InternalPondChannel | null {
        const channel = this.getPrivateChannel(channelId);
        if (channel)
            return new InternalPondChannel(channel);

        return null;
    }

    /**
     * @desc Sends a message to a client on the endpoint.
     * @param clientId - The id of the client to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    public send(clientId: string | string[], event: string, message: default_t): void {
        const newMessage: ServerMessage = {
            action: 'MESSAGE', clientId: 'SERVER',
            channelName: 'SERVER', event, payload: message,
            addresses: Array.isArray(clientId) ? clientId : [clientId]
        }

        this.endpoint.subject.next(newMessage);
    }

    /**
     * @desc Closes a client connection to the endpoint.
     * @param clientId - The id of the client to close the connection to.
     */
    public closeConnection(clientId: string): void {
        const message: ServerMessage = {
            action: 'CLOSED_FROM_SERVER', clientId: 'SERVER',
            channelName: 'SERVER', event: 'CLOSED_FROM_SERVER', payload: {},
            addresses: [clientId]
        }

        this.endpoint.subject.next(message);
    }

    /**
     * @desc lists all the channels in the endpoint
     */
    public listChannels(): PondChanelInfo[] {
        return this.endpoint.channels.toArrayMap(([_, channel]) => channel.info);
    }

    /**
     * @desc Gets a channel by id from the endpoint.
     * @param channelId - The id of the channel to get.
     * @private
     */
    private getPrivateChannel(channelId: string): Channel | null {
        return this.endpoint.channels.get(channelId) || null;
    }

    /**
     * @desc Listen for a message on the subject.
     * @private
     */
    private listen(): void {
        this.endpoint.subject
            .subscribe(message => {
                if (message.action === 'CHANNEL_DESTROY') {
                    this.endpoint.channels.deleteKey(message.clientId);
                    return;
                }
            });
    }
}
