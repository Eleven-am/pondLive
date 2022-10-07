/// <reference types="node" />
import { ServerResponse } from "http";
export declare class PondHTTPResponse {
    private _responseSent;
    private statusCode;
    private readonly _response;
    constructor(response: ServerResponse);
    json(data: any): void;
    html(data: string): void;
    send(data: any): void;
    redirect(url: string): void;
    setHeader(key: string, value: string): PondHTTPResponse;
    getHttpServerResponse(): ServerResponse;
    end(): void;
    pipe(stream: any): void;
    status(code: number, message?: string): PondHTTPResponse;
}
