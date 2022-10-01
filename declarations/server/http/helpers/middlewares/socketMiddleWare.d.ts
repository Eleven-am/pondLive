/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { IncomingMessage, Server } from "http";
import internal from "stream";
import { NextFunction } from "./middleWare";
declare type SocketMiddlewareFunction = (req: IncomingMessage, socket: internal.Duplex, head: Buffer, next: NextFunction) => void;
export declare class SocketMiddleWare {
    constructor(server: Server);
    use(middleware: SocketMiddlewareFunction): void;
}
export {};
