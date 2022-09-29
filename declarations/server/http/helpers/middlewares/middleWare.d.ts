/// <reference types="node" />
import { IncomingMessage, Server, ServerResponse } from "http";
import { BaseClass } from "../../../utils";
export declare type NextFunction = () => void;
export declare type MiddleWareFunction = (request: IncomingMessage, response: ServerResponse, next: NextFunction) => void;
export declare type Chain = {
    use: (middleware: MiddleWareFunction) => void;
};
export declare class MiddleWare extends BaseClass {
    private readonly _server;
    private readonly _stack;
    constructor(server: Server);
    get stack(): MiddleWareFunction[];
    use(middleware: MiddleWareFunction): void;
    private _execute;
    private _initMiddleware;
}
