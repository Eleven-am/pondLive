import {createServer, IncomingMessage, Server, ServerResponse} from "http";
import {MiddleWare, NextFunction} from "./helpers/middleWare";
import {PondSocket, EndpointHandler} from '../pondsocket';
import {FileRouter} from "./helpers/server/fileRouter";
import {AuthenticateRequest, AuthenticateUpgrade} from "./helpers/auth";
import {BodyParserMiddleware, JsonBodyParserMiddleware} from "./helpers/server/bodyParser";
import {CorsMiddleware} from "./helpers/server/cors";
import {PondHTTPResponse} from "./helpers/server/pondHTTPResponse";
import { VerbHandler } from "./helpers/verbs/verbHandler";
import { PondPath } from "../pondbase";
import { PondDeleteRequest, PondGetRequest, PondPatchRequest, PondPostRequest, PondPutRequest } from "./types";
import { GenerateLiveServer, Route } from "../pondlive";
import {ContextProvider} from "../pondlive/contextManager";

export interface PondLiveServerOptions {
    secret?: string;
    cookie?: string;
    index?: string;
    providers?: ContextProvider[];
}

export class PondServer {
    private readonly _server: Server;
    private readonly _middlewareChain: MiddleWare;
    private readonly _pondSocket: PondSocket;

    constructor() {
        this._server = createServer();
        this._middlewareChain = new MiddleWare(this._server);
        this._pondSocket = new PondSocket(this._server);
    }

    public listen(port: number, callback: () => void) {
        this._server.listen(port, callback);
    }

    public use(middleware: (req: IncomingMessage, res: ServerResponse, next: NextFunction) => void) {
        this._middlewareChain.use(middleware);
    }

    public get(path: PondPath, callback: (req: PondGetRequest, res: PondHTTPResponse) => void) {
        VerbHandler(this._middlewareChain, path, 'GET', callback);
    }

    public post(path: PondPath, callback: (req: PondPostRequest, res: PondHTTPResponse) => void) {
        VerbHandler(this._middlewareChain, path, 'POST', callback);
    }

    public put(path: PondPath, callback: (req: PondPutRequest, res: PondHTTPResponse) => void) {
        VerbHandler(this._middlewareChain, path, 'PUT', callback);
    }

    public delete(path: PondPath, callback: (req: PondDeleteRequest, res: PondHTTPResponse) => void) {
        VerbHandler(this._middlewareChain, path, 'DELETE', callback);
    }

    public patch(path: PondPath, callback: (req: PondPatchRequest, res: PondHTTPResponse) => void) {
        VerbHandler(this._middlewareChain, path, 'PATCH', callback);
    }

    public upgrade(path: PondPath, handler: EndpointHandler) {
        this._pondSocket.createEndpoint(path, handler);
    }

    public useStatic(path: string) {
        const handler = FileRouter(path);
        this.use(handler);
    }

    public useAuthenticator(secret: string, cookieName: string = 'authorization') {
        const authenticator = AuthenticateRequest(secret, cookieName);
        const socketAuthenticator = AuthenticateUpgrade(secret, cookieName);
        this._pondSocket.useOnUpgrade(socketAuthenticator);
        this.use(authenticator);
    }

    public useBodyParser() {
        const bodyParser = BodyParserMiddleware();
        const JSONParser = JsonBodyParserMiddleware();
        this.use(bodyParser);
        this.use(JSONParser);
    }

    public useCors() {
        const handler = CorsMiddleware();
        this.use(handler);
    }

    public usePondLive(routes: Route[], options: PondLiveServerOptions = {}) {
        const data = GenerateLiveServer(routes, this._server, this._middlewareChain, {
            pondSocket: this._pondSocket,
            htmlPath: options.index,
            secret: options.secret,
            cookie: options.cookie,
            providers: options.providers
        });

        return data.manager;
    }
}
