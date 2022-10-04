/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import {ChannelHandler, ChannelInfo, PondAssigns} from "../index";
import {ResponsePicker, ServerActions} from "../enums";
import internal from "stream";
import { WebSocket } from "ws";
import {IncomingHttpHeaders, IncomingMessage} from "http";
import {BaseClass, default_t, PondPath, PondResponse, Resolver} from "../utils";
import { PondChannel } from "./pondChannel";

export declare type EndpointHandler = (req: IncomingConnection, res: PondResponse<ResponsePicker.POND>, endpoint: Endpoint) => void;

export interface IncomingConnection {
    clientId: string;
    params: default_t<string>;
    query: default_t<string>;
    headers: IncomingHttpHeaders;
    address: string;
}

export type SocketCache = {
    clientId: string
    socket: WebSocket;
    assigns: PondAssigns;
}

export type ServerMessage = {
    action: ServerActions;
    channelName: string;
    payload: default_t;
    event: string;
}

export declare class Endpoint extends BaseClass {
    /**
     * @desc Accepts a new socket join request to the room provided using the handler function to authorise the socket
     * @param path - the pattern to accept || can also be a regex
     * @param handler - the handler function to authenticate the socket
     *
     * @example
     * const channel = endpoint.createChannel('channel:*', (req, res) => {
     *   const isAdmin = req.clientAssigns.admin;
     *   if (!isAdmin)
     *      return res.reject('You are not an admin');
     *
     *   res.accept({
     *      assign: {
     *         admin: true,
     *         joinedDate: new Date()
     *      },
     *      presence: {state: 'online'},
     *      channelData: {private: true}
     *   });
     * });
     *
     * channel.on('ping', (req, res, channel) => {
     *     const users = channel.getPresence();
     *     res.assign({
     *        assign: {
     *           pingDate: new Date(),
     *           users: users.length
     *        }
     *    });
     * })
     */
    createChannel(path: PondPath, handler: ChannelHandler): PondChannel;
    /**
     * @desc Authenticates the client to the endpoint
     * @param request - Incoming request
     * @param socket - Incoming socket
     * @param head - Incoming head
     * @param data - Incoming the data resolved from the handler
     */
    authoriseConnection(request: IncomingMessage, socket: internal.Duplex, head: Buffer, data: Resolver): Promise<void>;
    /**
     * @desc Closes a client connection to the endpoint.
     * @param clientId - The id of the client to close the connection to.
     */
    closeConnection(clientId: string): void;
    /**
     * @desc Sends a message to a client on the endpoint.
     * @param clientId - The id of the client to send the message to.
     * @param event - The event to send the message with.
     * @param message - The message to send.
     */
    send(clientId: string | string[], event: string, message: default_t): void;
    /**
     * @desc lists all the channels in the endpoint
     */
    listChannels(): ChannelInfo[];
    /**
     * @desc lists all the clients in the endpoint
     */
    listConnections(): WebSocket[];
    /**
     * @desc Broadcasts a message to all clients in the endpoint.
     * @param event - The event to broadcast.
     * @param message - The message to broadcast.
     */
    broadcast(event: string, message: default_t): void;
}
