/// <reference types="node" />
import { IncomingMessage, Server } from "http";
import { WebSocketServer } from "ws";
import { PondResponse } from "../index";
import PondEndpoint from "./endpoint";
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
