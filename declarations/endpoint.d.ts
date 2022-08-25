import { default_t, IncomingJoinMessage, PondResponse } from "../index";
import { EndpointInterpreter } from "./endpoint.state";
import { InternalPondChannel, PondChannel } from "./channel";
export default class PondEndpoint {
    private readonly endpoint;
    constructor(endpoint: EndpointInterpreter);
    /**
     * @desc Gets the context of the endpoint machine.
     * @private
     */
    private get context();
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
    /**
     * @desc Gets a channel by id from the endpoint.
     * @param channelId - The id of the channel to get.
     * @private
     */
    private getPrivateChannel;
}
