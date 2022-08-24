import {
    default_t, IncomingChannelMessage,
    IncomingJoinMessage, PondAssigns,
    PondChannel,
    PondChannelData,
    PondPresence,
    PondResponse, PondResponseAssigns
} from "../index";
import {EndpointContext, EndpointInterpreter} from "./endpoint.state";
import {assign} from "xstate";
import {BaseMap} from "./utils";
import {ChannelInterpreter} from "./channel.state";
import {InternalPondChannel} from "./channel";

export default class PondEndpoint {
    private readonly endpoint: EndpointInterpreter;

    constructor(endpoint: EndpointInterpreter) {
        this.endpoint = endpoint;
    }

    /**
     * @desc Gets the context of the endpoint machine.
     * @private
     */
    private get context(): EndpointContext{
        return this.endpoint.state.context;
    }

    /**
     * @desc Gets a channel by id from the endpoint.
     * @param channelId - The id of the channel to get.
     * @private
     */
    private getPrivateChannel(channelId: string): ChannelInterpreter | null {
        return this.context.channels.get(channelId) || null;
    }

    /**
     * @desc Broadcasts a message to all clients in the endpoint.
     * @param event - The event to broadcast.
     * @param message - The message to broadcast.
     */
    broadcast(event: string, message: default_t): void {
        const {observable} = this.context;
        const sockets = this.context.channels.toKeyValueArray().map(({value}) => value.state.context.presences.toArray()).flat();
        const addresses = sockets.map(a => a.id);
        observable.next({
            type: 'SERVER',
            subEvent: event,
            event: 'BROADCAST_MESSAGE',
            addresses: addresses,
            payload: message
        })
    }

    /**
     * @desc Sends a message to a channel in the endpoint.
     * @param channelId - The id of the channel to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    broadcastToChannel(channelId: string, event: string, message: default_t): void {
        const {observable} = this.context;
        const channel = this.getPrivateChannel(channelId);
        if(channel)
            observable.next({
                type: 'SERVER',
                channelId: channelId,
                subEvent: event,
                channelName: channel.state.context.channelName,
                event: 'BROADCAST_MESSAGE_TO_CHANNEL',
                addresses: Array.from(channel.state.context.presences.keys()),
                payload: message
            })
    }

    /**
     * @desc Disconnects a client from the endpoint.
     * @param clientId - The id of the client to disconnect.
     */
    close(clientId: string): void {
        const {observable} = this.context;
        observable.next({
            type: 'SERVER',
            event: 'DISCONNECT_CLIENT',
            addresses: [clientId],
        })
    }

    /**
     * @desc Closes a client connection to a channel in the endpoint.
     * @param channelId - The id of the channel to close the connection to.
     * @param clientId - The id of the client to close the connection to.
     */
    closeFromChannel(channelId: string, clientId: string): void {
        const {observable} = this.context;
        const channel = this.getPrivateChannel(channelId);
        if (channel)
            observable.next({
                type: 'SERVER',
                channelId: channelId,
                channelName: channel.state.context.channelName,
                event: 'DISCONNECT_CLIENT_FROM_CHANNEL',
                addresses: [clientId],
                payload: {}
            })
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
    createChannel(path: string | RegExp, handler: (req: IncomingJoinMessage, res: PondResponse) => void): PondChannel {
        const events = new BaseMap<string | RegExp, (req: IncomingChannelMessage, res: PondResponse, room: InternalPondChannel) => void>();

        assign({
            authorizers: new BaseMap(this.context.authorizers.set(path, {handler, events})),
        })

        return {
            on: (event: string | RegExp, handler: (req: IncomingChannelMessage, res: PondResponse, channel: InternalPondChannel) => void) => {
                events.set(event, handler);
            }
        }
    }

    /**
     * @desc Gets a channel by id from the endpoint.
     * @param channelId - The id of the channel to get.
     */
    getChannel(channelId: string): InternalPondChannel | null {
        const channel = this.getPrivateChannel(channelId);
        if (channel) {
            const {channelName, channelId} = channel.state.context;
            return new InternalPondChannel(channelName, channelId, channel);
        }
        return null;
    }

    /**
     * @desc Gets a channel's data by id from the endpoint.
     * @param channelId - The id of the channel to get the data of.
     */
    getChannelData(channelId: string): PondChannelData {
        const channel = this.getPrivateChannel(channelId);
        if (channel)
            return channel.state.context.channelData;

        return {};
    }

    /**
     * @desc Gets a channel's presence by id from the endpoint.
     * @param channelId - The id of the channel to get the presence of.
     */
    getPresence(channelId: string): PondPresence[] {
        const channel = this.getPrivateChannel(channelId);
        if (channel)
            return channel.state.context.presences.toArray();
        return [];
    }

    /**
     * @desc Sends a message to a client on the endpoint.
     * @param clientId - The id of the client to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    send(clientId: string | string[], event: string, message: default_t): void {
        const {observable} = this.context;
        observable.next({
            type: 'SERVER',
            event: 'BROADCAST_MESSAGE',
            addresses: Array.isArray(clientId) ? clientId : [clientId],
            subEvent: event,
            payload: message
        })
    }

    /**
     * @desc Modify the presence of a client in a channel on the endpoint.
     * @param channelId - The id of the channel to modify the presence of.
     * @param clientId - The id of the client to modify the presence of.
     * @param assigns - The assigns to modify the presence with.
     */
    modifyPresence(channelId: string, clientId: string, assigns: PondResponseAssigns): void {
        const channel = this.getPrivateChannel(channelId);
        if (channel) {
            const clientPresence = channel.state.context.presences.get(clientId);
            const clientAssigns = channel.state.context.assigns.get(clientId);
            if (clientPresence && clientAssigns) {
                const internalAssigns: PondAssigns = {...clientAssigns, ...assigns.assign};
                const internalPresence: PondPresence = {...clientPresence, ...assigns.presence};

                channel.send({
                    type: 'updatePresence',
                    clientId: clientId,
                    presence: internalPresence,
                    assigns: internalAssigns,
                })
            }
        }
    }
}
