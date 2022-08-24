import {IncomingMessage} from "node:http";
import {WebSocket, WebSocketServer} from "ws";
import internal from "stream";
import {assign, createMachine, interpret, Interpreter} from "xstate";
import {BaseClass, BaseMap, BasePromise, RejectPromise} from "./utils";
import {Server} from "http";
import {parse} from "url";
import {EndpointInterpreter} from "./endpoint.state";

type MachineContext = {
    server: Server;
    socketServer: WebSocketServer;
    paths: BaseMap<string, string | RegExp>;
    connections: BaseMap<string, WebSocket>;
    endpoints: BaseMap<string, EndpointInterpreter>;
}

export type ServerInterpreter = Interpreter<MachineContext, any, ServerMachineEvent, { value: any; context: MachineContext; }, any>

type SpawnEndpointEvent = {
    type: 'spawnEndpoint';
    data: {
        endpoint: EndpointInterpreter;
        path: string | RegExp;
        endpointId: string;
    }
}

type PassSocketToEndPointEvent = {
    type: 'done.invoke.(machine).authenticate:invocation[0]';
    data: InternalPassSocketToEndPointEvent;
}

export type InternalPassSocketToEndPointEvent = {
    endpointId: string;
    endpoint: string;
    socket: internal.Duplex;
    request: IncomingMessage;
    head: Buffer;
}

type RejectRequestEvent = {
    type: 'error.platform.(machine).authenticate:invocation[0]';
    data: RejectPromise<internal.Duplex>;
}

type ShutDownServerEvent = {
    type: 'error.platform.(machine).idle:invocation[0]' | 'shutdown' | 'error';
    data: RejectPromise<string>;
}

type SetUpServerEvent = {
    type: 'done.invoke.(machine).idle:invocation[0]';
    data: void;
}

type AuthenticateSocketEvent = {
    type: 'authenticateSocket';
    data: {
        socket: internal.Duplex;
        request: IncomingMessage;
        head: Buffer;
    }
}

type ServerMachineEvent =
    PassSocketToEndPointEvent
    | RejectRequestEvent
    | ShutDownServerEvent
    | AuthenticateSocketEvent
    | SpawnEndpointEvent
    | SetUpServerEvent;

export class ServerMachine {
    private readonly base: BaseClass;
    interpreter: ServerInterpreter;

    constructor(context: MachineContext) {
        this.base = new BaseClass();
        this.interpreter = this.start(context);
    }

    /**
     * @desc Starts the server machine
     * @param context - The machine context
     * @private
     */
    private start(context: MachineContext) {
        const machine =
            /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlwgBswBiCAe0LPwDc6BrMEtLPQ08qggKtM6AC64GAbQAMAXUSgADnVi4JDRSAAeiAEwyAHCQDsATgBsMgCyWZlgKx6AzABoQAT0TOTJa84BGPRMTAIdbMwczawsAX1j3bhwCYjJKGjAAJ0y6TJIlCnEAM1zULgxkvjTBYTpRDXxZBSQQFTUGrV0EFxkSaMMfC0MHCz1rGRNrdy8EEeMzEL0LAOGTCwtnZ3jEit5UzLB0CA9qWGwAVzF6AHd8LTb1STuWroCZGQdTUYdDGOswwxGabeZwWEiGSbOazhX4yN7OBzbEBJPakA5HE5ZHKZe6qR6aF6IN4uEijOETPSGYZmIGebyTUybMyGAKbAKhWxIlEpNGHY7UdCXbBgfASepgADKdQ4Ylx7SenUQtk+TLMkWhENCemBCACATBzkMFjWgQGbyCJi5ux5JHR-NgSnQtwAovgICoCLKWg8OoSEIDjO89GY9AFoaCHKEdYFfIa3oYXGZAnC4glkdaqoKxMLRbhxbQGJxahxyjwbVmc2LxGAhCw6uInk05fjnqBXjI9HoSPDmYDiZ2Ajqw74Ps53mP9eEaZa09zM0KRVWxBlsrl8oUxCVMmU56kK4u89XayIG9J5M3fW39As+tZxnrIhYnIYzEPI6Y4aGX4bDZykfg6AgOAtF3fh0gvBU-X1Yx9WsSZlUNSY1h1YNfHZEInHsawjT-HYyyqO0ZmUPFLx0RBRmsUlOx+Q0HBWKY6QQABaWwSHsMwVgTWwWQRQwrXw1Jl23AhqwlLJmCyCCCSvXUO16BYn3eGx1hMSkdQcUE+iNIYxw7I0Rn4yo9wXXNxSk1syIQKxjHWBwbE2cYTCNEx1IMcE7IsaFmRDUJDNRczFV1O9u08+DIkQuCLB1JiggCNijR8RwY0WeJ4iAA */
            createMachine({
                context: context,
                predictableActionArguments: true,
                tsTypes: {} as import("./server.state.typegen").Typegen0,
                schema: {context: {} as MachineContext, events: {} as ServerMachineEvent},
                id: "(machine)",
                initial: "idle",
                states: {
                    idle: {
                        invoke: {
                            src: "setupServer",
                            onDone: [
                                {
                                    target: "ready",
                                },
                            ],
                            onError: [
                                {
                                    target: "terminateServer",
                                },
                            ],
                        },
                    },
                    ready: {
                        on: {
                            shutdown: {
                                target: "terminateServer",
                            },
                            error: {
                                target: "terminateServer",
                            },
                            authenticateSocket: {
                                target: "authenticate",
                            },
                            spawnEndpoint: {
                                actions: "spawnEndpoint",
                            },
                        },
                    },
                    terminateServer: {
                        entry: "shutDownServer",
                        type: "final",
                    },
                    authenticate: {
                        invoke: {
                            src: "findEndpoint",
                            onDone: [
                                {
                                    actions: "passSocketToEndpoint",
                                    target: "ready",
                                },
                            ],
                            onError: [
                                {
                                    actions: "rejectRequest",
                                    target: "ready",
                                },
                            ],
                        },
                    },
                },
            }, {
                actions: {
                    passSocketToEndpoint: (context, event) => ServerMachine.passSocketToEndpoint(context, event),
                    rejectRequest: (context, event) => ServerMachine.rejectRequest(context, event),
                    spawnEndpoint: (context, event) => ServerMachine.spawnEndpoint(context, event),
                    shutDownServer: (context, event) => this.shutDownServer(context, event),
                },
                services: {
                    setupServer: (context, event) => this.setupServer(context, event),
                    findEndpoint: (context, event) => this.findEndpoint(context, event),
                }
            })

        return interpret(machine).start();
    }

    /**
     * @desc Passes a socket to the endpoint
     * @param ctx - The machine context
     * @param event - The event triggering the action
     */
    private static passSocketToEndpoint(ctx: MachineContext, event: PassSocketToEndPointEvent) {
        const {socket, endpointId} = event.data;
        const {endpoints} = ctx;

        const newEndpoint = endpoints.get(endpointId);
        if (newEndpoint === undefined) {
            socket.write(`HTTP/1.1 503 Endpoint Not Found\r\n\r\n`);
            socket.destroy();

            return;
        }

        newEndpoint.send({
            type: 'authenticateSocket',
            data: event.data
        })
    }

    /**
     * @desc Rejects a socket request
     * @param _ctx - The machine context
     * @param event - The event triggering the action
     */
    private static rejectRequest (_ctx: MachineContext, event: RejectRequestEvent) {
        event.data.data.write(`HTTP/1.1 ${event.data.errorCode} ${event.data.errorMessage}\r\n\r\n`);
        event.data.data.destroy();
    }

    /**
     * @desc Shuts down the server
     * @param ctx - The machine context
     * @param event - The event triggering the action
     */
    private shutDownServer  (ctx: MachineContext, event: ShutDownServerEvent)  {
        ctx.socketServer.clients.forEach((client) => client.terminate());
        ctx.socketServer.close();
        ctx.server.close();
        this.interpreter.stop();

        console.log("Server shut down", event.data);
        process.exit(0);
    }

    /**
     * @desc Spawns a new endpoint
     * @param ctx - The machine context
     * @param event - The event triggering the action
     */
    private static spawnEndpoint (ctx: MachineContext, event: SpawnEndpointEvent) {
        const {endpoint, path, endpointId} = event.data;
        const {paths, endpoints} = ctx;

        assign({
            paths: new BaseMap(paths.set(endpointId, path)),
            endpoints: new BaseMap(endpoints.set(endpointId, endpoint)),
        })
    }

    /**
     * @desc sets up the server
     * @param ctx - The machine context
     * @param _event - The event triggering the action
     */
    private setupServer (ctx: MachineContext, _event: any) {
        return BasePromise<void, string>((resolve, reject) => {
            ctx.server.on('upgrade', (request, socket, head) => {
                this.interpreter.send({
                    type: 'authenticateSocket',
                    data: {
                        request, head, socket,
                    }
                })
            });
            ctx.server.on('error', (error) => {
                return reject('Error: ', 500, error.message);
            });
            ctx.server.on('listening', () => {
                this.pingClients(ctx.socketServer);
                return resolve();
            });
        }, 'setupServer');
    }

    /**
     * @desc finds the endpoint for the socket
     * @param ctx - The machine context
     * @param event - The event triggering the action
     */
    private findEndpoint (ctx: MachineContext, event: AuthenticateSocketEvent) {
        return BasePromise<InternalPassSocketToEndPointEvent, internal.Duplex>((resolve, reject) => {
            const {pathname} = parse(event.data.request.url || '');

            if (!pathname)
                return reject('No pathname found', 404, event.data.socket);

            const endpoint = ctx.paths.find((endpoint) => this.base.compareStringToPattern(pathname, endpoint));
            if (endpoint) {
                resolve({
                    endpointId: endpoint.key,
                    endpoint: pathname,
                    socket: event.data.socket,
                    request: event.data.request,
                    head: event.data.head,
                });

            } else
                return reject('Unable to resolve endpoint', 404, event.data.socket);
        }, event.data.socket);
    }

    /**
     * @desc Makes sure that every client is still connected to the pond
     * @param server - WebSocket server
     */
    private pingClients (server: WebSocketServer) {
        server.on('connection', (ws: WebSocket & { isAlive?: boolean }) => {
            ws.isAlive = true;
            ws.on('pong', () => {
                ws.isAlive = true;
            });
        });

        const interval = setInterval(() => {
            server.clients.forEach((ws: WebSocket & { isAlive?: boolean }) => {
                if (ws.isAlive === false) return ws.terminate();
                ws.isAlive = false;
                ws.ping();
            })
        }, 30000);

        server.on('close', () => clearInterval(interval))
    }
}
