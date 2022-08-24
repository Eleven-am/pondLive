import {IncomingMessage, Server} from "http";
import {WebSocket, WebSocketServer} from "ws";
import {IncomingChannelMessage, IncomingJoinMessage, PondResponse} from "../index";
import {BaseClass, BaseMap} from "./utils";
import {ServerInterpreter, ServerMachine} from "./server.state";
import {EndpointInternalEvents, EndpointInterpreter, EndpointMachine} from "./endpoint.state";
import PondEndpoint from "./endpoint";
import {Subject} from "rxjs";
import {ChannelInterpreter} from "./channel.state";
import {InternalPondChannel} from "./channel";
import {assign} from "xstate";

export default class PondServer {
    private readonly utils: BaseClass;
    private readonly server: Server;
    private readonly machine: ServerInterpreter;
    private readonly socketServer: WebSocketServer;

    constructor(server?: Server, socketServer?: WebSocketServer) {
        this.utils = new BaseClass();
        this.server = server || new Server();
        this.socketServer = socketServer || new WebSocketServer({ noServer: true });
        this.machine = new ServerMachine({
            server: this.server,
            socketServer: this.socketServer,
            paths: new BaseMap<string, string | RegExp>(),
            connections: new BaseMap<string, WebSocket>(),
            endpoints: new BaseMap<string, EndpointInterpreter>(),
        }).interpreter;
    }

    /**
     * @desc Specifies the port to listen on
     * @param port - the port to listen on
     * @param callback - the callback to call when the server is listening
     */
    listen(port: number, callback: (port?: number) => void) {
        return this.server.listen(port, callback);
    }

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
    createEndpoint(path: string | RegExp, handler: (req: IncomingMessage, res: PondResponse) => void): PondEndpoint {
        const endpointId = this.utils.uuid();
        const generateEndpoint = new EndpointMachine({
            handler: handler,
            channels: new BaseMap<string, ChannelInterpreter>(),
            socketServer: this.socketServer,
            authorizers: new BaseMap<string | RegExp, {
                handler: (req: IncomingJoinMessage, res: PondResponse) => void
                events: BaseMap<string | RegExp, (req: IncomingChannelMessage, res: PondResponse, room: InternalPondChannel) => void>;
            }>(),
            observable: new Subject<EndpointInternalEvents>(),
            server: this.server,
        }, endpointId).interpreter;

        const context = this.machine.state.context;

        assign({
            paths: new BaseMap(context.paths.set(endpointId, path)),
            endpoints: new BaseMap(context.endpoints.set(endpointId, generateEndpoint))
        })

        return new PondEndpoint(generateEndpoint);
    }
}
