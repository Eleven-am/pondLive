/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
import { NextFunction } from "./helpers/middlewares/middleWare";
import { EndpointHandler } from '../socket';
import { Route } from "../live";
import { PondDeleteRequest, PondGetRequest, PondPatchRequest, PondPath, PondPostRequest, PondPutRequest } from "../types";
import { PondHTTPResponse } from "./helpers/server/pondHTTPResponse";
export declare class PondServer {
    constructor();
    listen(port: number, callback: () => void): void;
    use(middleware: (req: IncomingMessage, res: ServerResponse, next: NextFunction) => void): void;
    get(path: PondPath, callback: (req: PondGetRequest, res: PondHTTPResponse) => void): void;
    post(path: PondPath, callback: (req: PondPostRequest, res: PondHTTPResponse) => void): void;
    put(path: PondPath, callback: (req: PondPutRequest, res: PondHTTPResponse) => void): void;
    delete(path: PondPath, callback: (req: PondDeleteRequest, res: PondHTTPResponse) => void): void;
    patch(path: PondPath, callback: (req: PondPatchRequest, res: PondHTTPResponse) => void): void;
    upgrade(path: PondPath, handler: EndpointHandler): void;
    useStatic(path: string): void;
    useAuthenticator(secret: string, cookieName?: string): void;
    useBodyParser(): void;
    useCors(): void;
    usePondLive(routes: Route[], htmlPath?: string): void;
}
