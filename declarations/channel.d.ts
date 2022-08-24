import { default_t, PondChannelData, PondPresence, PondResponseAssigns } from "../index";
import { ChannelInterpreter } from "./channel.state";
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
