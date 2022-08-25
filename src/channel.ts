import {
    default_t,
    IncomingChannelMessage,
    PondAssigns,
    PondChannelData,
    PondPresence, PondResponse,
    PondResponseAssigns
} from "../index";
import {ChannelInterpreter} from "./channel.state";
import {EndpointContext, EndpointInterpreter} from "./endpoint.state";
import {BaseMap} from "./utils";

export class InternalPondChannel {
    private readonly channelName: string
    private readonly endpoint: ChannelInterpreter;
    private readonly channelId: string

    constructor(channelName: string, channelId: string, endpoint: ChannelInterpreter) {
        this.channelName = channelName;
        this.channelId = channelId;
        this.endpoint = endpoint;
    }

    /**
     * @desc Gets the current presence of the channel
     */
    getPresence(): PondPresence[] {
        return this.endpoint.state.context.presences.toKeyValueArray().map(x => x.value);
    }

    /**
     * @desc Gets the current channel data
     */
    getChannelData(): PondChannelData {
        return this.endpoint.state.context.channelData;
    }

    /**
     * @desc Modifies the presence state of a client on the channel
     * @param clientId - The clientId to modify the presence of
     * @param assigns - The assigns to modify the presence with
     */
    modifyPresence(clientId: string, assigns: PondResponseAssigns): void {
        const clientPresence = this.endpoint.state.context.presences.get(clientId);
        const clientAssigns = this.endpoint.state.context.assigns.get(clientId);
        if (clientPresence && clientAssigns) {
            const internalAssigns: PondAssigns = {...clientAssigns, ...assigns.assign};
            const internalPresence: PondPresence = {...clientPresence, ...assigns.presence};

            this.endpoint.send({
                type: 'updatePresence',
                clientId: clientId,
                presence: internalPresence,
                assigns: internalAssigns,
            })
        }
    }

    /**
     * @desc Closes the channel from the given clientId
     * @param clientId - The clientId to close the channel from, can be an array of clientIds
     */
    closeFromChannel(clientId: string | string[]): void {
        this.endpoint.state.context.observable.next({
            type: 'SERVER',
            channelId: this.channelId,
            channelName: this.channelName,
            event: 'DISCONNECT_CLIENT_FROM_CHANNEL',
            addresses: Array.isArray(clientId) ? clientId : [clientId],
            payload: {}
        })
    }

    /**
     * @desc Broadcasts a message to the channel
     * @param event - The event to send the message to
     * @param message - The message to send
     */
    broadcast(event: string, message: default_t): void {
        this.endpoint.state.context.observable.next({
            type: 'SERVER',
            channelId: this.channelId,
            subEvent: event,
            channelName: this.channelName,
            event: 'BROADCAST_MESSAGE_TO_CHANNEL',
            addresses: this.endpoint.state.context.presences.toKeyValueArray().map(x => x.key),
            payload: message
        })
    }

    /**
     * @desc Sends a message to the channel
     * @param clientId - The clientId to send the message to, can be an array of clientIds
     * @param event - The event to send the message to
     * @param message - The message to send
     */
    send(clientId: string | string[], event: string, message: default_t): void {
        this.endpoint.state.context.observable.next({
            type: 'SERVER',
            channelId: this.channelId,
            subEvent: event,
            channelName: this.channelName,
            event: 'BROADCAST_MESSAGE_TO_CHANNEL',
            addresses: Array.isArray(clientId) ? clientId : [clientId],
            payload: message
        })
    }
}

export class PondChannel {
    private readonly endpoint: EndpointInterpreter;
    private readonly events: BaseMap<string | RegExp, (req: IncomingChannelMessage, res: PondResponse, room: InternalPondChannel) => void>

    constructor(endpoint: EndpointInterpreter, events: BaseMap<string | RegExp, (req: IncomingChannelMessage, res: PondResponse, room: InternalPondChannel) => void>) {
        this.endpoint = endpoint;
        this.events = events;
    }

    /**
     * @desc A listener for a channel event
     * @param event - The event to listen for, can be a regex
     * @param callback - The callback to call when the event is received
     */
    on(event: string | RegExp, callback: (req: IncomingChannelMessage, res: PondResponse, room: InternalPondChannel) => void): void {
        this.events.set(event, callback);
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
