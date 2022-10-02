/// <reference types="node" />
import { MiddleWare, NextFunction } from "../helpers/middlewares/middleWare";
import { IncomingMessage } from "http";
import { PondPath } from "../../types";
import { PondHTTPResponse } from "../helpers/server/pondHTTPResponse";
declare type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
export declare const VerbHandler: <T extends IncomingMessage>(chain: MiddleWare, path: PondPath, method: HTTPMethod, handler: (req: T, res: PondHTTPResponse, next: NextFunction) => void) => void;
export {};
