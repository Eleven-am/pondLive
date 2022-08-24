import { default_t, IncomingJoinMessage, PondChannel, PondChannelData, PondPresence, PondResponse, PondResponseAssigns } from "../index";
import { EndpointInterpreter } from "./endpoint.state";
import { InternalPondChannel } from "./channel";
export default class PondEndpoint {
    private readonly endpoint;
    constructor(endpoint: EndpointInterpreter);
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
     * @desc Broadcasts a message to all clients in the endpoint.
     * @param event - The event to broadcast.
     * @param message - The message to broadcast.
     */
    broadcast(event: string, message: default_t): void;
    /**
     * @desc Sends a message to a channel in the endpoint.
     * @param channelId - The id of the channel to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    broadcastToChannel(channelId: string, event: string, message: default_t): void;
    /**
     * @desc Disconnects a client from the endpoint.
     * @param clientId - The id of the client to disconnect.
     */
    close(clientId: string): void;
    /**
     * @desc Closes a client connection to a channel in the endpoint.
     * @param channelId - The id of the channel to close the connection to.
     * @param clientId - The id of the client to close the connection to.
     */
    closeFromChannel(channelId: string, clientId: string): void;
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
     * @desc Sends a message to a client on the endpoint.
     * @param clientId - The id of the client to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    send(clientId: string | string[], event: string, message: default_t): void;
    /**
     * @desc Modify the presence of a client in a channel on the endpoint.
     * @param channelId - The id of the channel to modify the presence of.
     * @param clientId - The id of the client to modify the presence of.
     * @param assigns - The assigns to modify the presence with.
     */
    modifyPresence(channelId: string, clientId: string, assigns: PondResponseAssigns): void;
}
