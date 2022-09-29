/// <reference types="node" />
import { ServerResponse } from "http";
import { PondResponse } from "../../utils/pondResponse";
declare type Response = ServerResponse | PondResponse;
declare type RouterType = 'http' | 'socket' | 'client-router';
export declare type RouterHeaders = {
    pageTitle: string | undefined;
    flashMessage: string | undefined;
};
export declare class LiveRouter {
    private readonly _response;
    private _responseSent;
    private readonly _routerType;
    private readonly _headers;
    constructor(response: Response, routerType?: RouterType);
    set pageTitle(title: string);
    set flashMessage(message: string);
    get headers(): RouterHeaders;
    push(path: string): Promise<void> | void;
    redirect(path: string): Promise<void> | void;
    replace(path: string): Promise<void> | void;
    get sentResponse(): boolean;
    private _sendResponse;
    private _sendPondResponse;
    private _sendClientRouterResponse;
}
export {};
