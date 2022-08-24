import {default_t, PondAssigns, PondChannelData, PondPresence, PondResponseAssigns} from "../index";
import {ChannelInterpreter} from "./channel.state";

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
