import { default_t, IncomingChannelMessage, PondChannelData, PondPresence, PondResponse, PondResponseAssigns } from "../index";
import { ChannelInterpreter } from "./channel.state";
import { EndpointInterpreter } from "./endpoint.state";
import { BaseMap } from "./utils";
export declare class InternalPondChannel {
    private readonly channelName;
    private readonly endpoint;
    private readonly channelId;
    constructor(channelName: string, channelId: string, endpoint: ChannelInterpreter);
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
export declare class PondChannel {
    private readonly endpoint;
    private readonly events;
    constructor(endpoint: EndpointInterpreter, events: BaseMap<string | RegExp, (req: IncomingChannelMessage, res: PondResponse, room: InternalPondChannel) => void>);
    /**
     * @desc A listener for a channel event
     * @param event - The event to listen for, can be a regex
     * @param callback - The callback to call when the event is received
     */
    on(event: string | RegExp, callback: (req: IncomingChannelMessage, res: PondResponse, room: InternalPondChannel) => void): void;
    /**
     * @desc Gets the context of the endpoint machine.
     * @private
     */
    private get context();
    /**
     * @desc Gets a channel by id from the endpoint.
     * @param channelId - The id of the channel to get.
     * @private
     */
    private getPrivateChannel;
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
