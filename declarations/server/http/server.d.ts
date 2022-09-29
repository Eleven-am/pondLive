/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
import { PondPath } from "../types";
import { EndpointHandler } from "../socket/endpoint";
import { PondDeleteRequest, PondGetRequest, PondPatchRequest, PondPostRequest, PondPutRequest } from "./verbs";
import { NextFunction } from "./helpers";
import { Route } from "../live/component/liveComponent";
export declare class PondServer {
    private readonly _server;
    private readonly _middlewareChain;
    private readonly _pondSocket;
    constructor();
    listen(port: number, callback: () => void): void;
    use(middleware: (req: IncomingMessage, res: ServerResponse, next: NextFunction) => void): void;
    get(path: PondPath, callback: (req: PondGetRequest, res: ServerResponse) => void): void;
    post(path: PondPath, callback: (req: PondPostRequest, res: ServerResponse) => void): void;
    put(path: PondPath, callback: (req: PondPutRequest, res: ServerResponse) => void): void;
    delete(path: PondPath, callback: (req: PondDeleteRequest, res: ServerResponse) => void): void;
    patch(path: PondPath, callback: (req: PondPatchRequest, res: ServerResponse) => void): void;
    upgrade(path: PondPath, handler: EndpointHandler): void;
    useStatic(path: string): void;
    useAuthenticator(secret: string, cookieName?: string): void;
    useBodyParser(): void;
    useCors(): void;
    usePondLive(routes: Route[], htmlPath?: string): void;
}
