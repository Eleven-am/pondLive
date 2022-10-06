/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
import { NextFunction } from "./helpers/middleWare";
import { EndpointHandler } from '../pondsocket';
import { PondHTTPResponse } from "./helpers/server/pondHTTPResponse";
import { PondPath } from "../pondbase";
import { PondDeleteRequest, PondGetRequest, PondPatchRequest, PondPostRequest, PondPutRequest } from "./types";
import { Route } from "../pondlive";
import {ContextProvider} from "../pondlive/contextManager";

export interface PondLiveServerOptions {
    secret?: string;
    cookie?: string;
    index?: string;
    providers?: ContextProvider[];
}

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
    usePondLive(routes: Route[], options?: PondLiveServerOptions): import("../pondlive").PondLiveChannelManager;
}
