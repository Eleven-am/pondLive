import { BaseClass } from "../utils/baseClass";
import { default_t, IncomingChannelMessage, IncomingJoinMessage, PondMessage, PondPath, PondResponseAssigns, RejectPromise, SocketCache } from "../types";
import { PondResponse } from "../utils/pondResponse";
import { Channel, ChannelEvent, ChannelInfo } from "./channel";
import { Anything, Subscription } from "../utils/pubSub";
export declare type ChannelHandler = (req: IncomingJoinMessage, res: PondResponse, channel: Channel) => void;
export declare type Subscriber = (event: ChannelEvent) => Anything<RejectPromise<{
    event: string;
    channelName: string;
}> | boolean>;
export declare class PondChannel extends BaseClass {
    readonly path: PondPath;
    private readonly _handler;
    private readonly _channels;
    private readonly _subscriptions;
    private readonly _subscribers;
    constructor(path: PondPath, handler: ChannelHandler);
    /**
     * @desc A listener for a channel event
     * @param event - The event to listen for, can be a regex
     * @param callback - The callback to call when the event is received
     */
    on(event: PondPath, callback: (req: IncomingChannelMessage, res: PondResponse, channel: Channel) => void): Subscription;
    /**
     * @desc Add new user to channel
     * @param user - The user to add to the channel
     * @param channelName - The name of the channel
     * @param joinParams - The params to join the channel with
     */
    addUser(user: SocketCache, channelName: string, joinParams: default_t): Promise<void>;
    /**
     * @desc Sends a message to a channel in the endpoint.
     * @param channelName - The name of the channel to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    broadcastToChannel(channelName: string, event: string, message: PondMessage): void;
    /**
     * @desc Closes a client connection to a channel in the endpoint.
     * @param channelName - The name of the channel to close the connection to.
     * @param clientId - The id of the client to close the connection to.
     */
    closeFromChannel(channelName: string, clientId: string | string[]): void;
    /**
     * @desc Modify the presence of a client in a channel on the endpoint.
     * @param channelName - The name of the channel to modify the presence of.
     * @param clientId - The id of the client to modify the presence of.
     * @param assigns - The assigns to modify the presence with.
     */
    modifyPresence(channelName: string, clientId: string, assigns: PondResponseAssigns): void;
    /**
     * @desc Gets the information of the channel
     * @param channelName - The name of the channel to get the information of.
     */
    getChannelInfo(channelName: string): ChannelInfo;
    /**
     * @desc Sends a message to the channel
     * @param channelName - The name of the channel to send the message to.
     * @param clientId - The clientId to send the message to, can be an array of clientIds
     * @param event - The event to send the message to
     * @param message - The message to send
     */
    send(channelName: string, clientId: string | string[], event: string, message: default_t): void;
    /**
     * @desc Gets a list of all the channels in the endpoint.
     */
    get info(): ChannelInfo[];
    /**
     * @desc Searches for a channel in the endpoint.
     * @param query - The query to search for.
     */
    findChannel(query: (channel: Channel) => boolean): Channel | null;
    /**
     * @desc Subscribes a function to a channel in the endpoint.
     * @param channelName - The name of the channel to subscribe to.
     * @param callback - The function to subscribe to the channel.
     */
    subscribe(channelName: string, callback: Subscriber): Subscription;
    /**
     * @desc removes a user from all channels
     * @param clientId - The id of the client to remove
     */
    removeUser(clientId: string): void;
    /**
     * @desc Executes a function on a channel in the endpoint.
     * @param channelName - The name of the channel to execute the function on.
     * @param handler - The function to execute on the channel.
     * @private
     */
    private _execute;
    /**
     * @desc Creates a new channel in the endpoint.
     * @param channelName - The name of the channel to create.
     * @private
     */
    private _createChannel;
    /**
     * @desc Sends a message to a client
     * @param socket - The socket to send the message to
     * @param message - The message to send
     */
    private static _sendMessage;
    /**
     * @desc Removes a subscription from a user
     * @param clientId - The id of the client to remove the subscription from
     * @param channelName - The name of the channel to remove the subscription from
     * @private
     */
    private _removeSubscriptions;
    /**
     * @desc Builds an event handler for a channel
     * @param event - The event to build the handler for
     * @param callback - The callback to build the handler for
     * @private
     */
    private _buildHandler;
}
