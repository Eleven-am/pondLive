/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
import internal from "stream";
import { NextFunction } from "../middlewares";
export declare type AuthenticatedRequest = IncomingMessage & {
    clientId?: string;
    token?: string;
};
declare type IAuthenticateRequest = (secret: string, cookie: string) => (req: AuthenticatedRequest, res: ServerResponse, next: NextFunction) => void;
declare type IAuthSocketRequest = (secret: string, cookie: string) => (req: AuthenticatedRequest, socket: internal.Duplex, head: Buffer, next: NextFunction) => void;
export declare const AuthenticateRequest: IAuthenticateRequest;
export declare const AuthenticateUpgrade: IAuthSocketRequest;
export {};
