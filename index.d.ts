import { InternalPondChannel } from "./src/channel";
import { IncomingMessage, Server } from "http";
import { WebSocketServer } from "ws";
import PondEndpoint from "./src/endpoint";

export type default_t = {
    [key: string]: any;
}

export type InternalAssigns = default_t & {clientId: string};

export type RemoveClientId<T> = Omit<T, "clientId">;

export type PondAssigns = RemoveClientId<InternalAssigns>;
export type PondPresence = RemoveClientId<InternalAssigns>;
export type PondChannelData = RemoveClientId<InternalAssigns>;

export interface PondResponseAssigns {
    assign?: PondAssigns;
    presence?: PondPresence;
    channelData?: PondChannelData;
}

export interface IncomingJoinMessage {
    clientId: string;
    channelId: string;
    channelName: string;
    clientAssigns: PondAssigns;
}

export interface IncomingChannelMessage {
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

export interface PondChannel {
    on: (event: string | RegExp, handler: (req: IncomingChannelMessage, res: PondResponse, channel: InternalPondChannel) => void) => void;
}

export default class PondServer {
    private readonly utils;
    private readonly server;
    private readonly machine;
    private readonly socketServer;
    constructor(server?: Server, socketServer?: WebSocketServer);
    /**
     * @desc Specifies the port to listen on
     * @param port - the port to listen on
     * @param callback - the callback to call when the server is listening
     */
    listen(port: number, callback: (port?: number) => void): Server;
    /**
     * @desc Accepts a new socket upgrade request on the provided endpoint using the handler function to authenticate the socket
     * @param path - the pattern to accept || can also be a regex
     * @param handler - the handler function to authenticate the socket
     *
     * @example
     * const endpoint = pond.createEndpoint('/api/v1/auth', (req, res) => {
     *    const { query } = parse(req.url || '');
     *    const { token } = query;
     *    if (!token)
     *        return res.decline('No token provided');
     *
     *    res.accept({ token });
     * })
     */
    createEndpoint(path: string | RegExp, handler: (req: IncomingMessage, res: PondResponse) => void): PondEndpoint;
}