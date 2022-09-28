/// <reference types="node" />
import { MiddleWare, NextFunction } from "../helpers/middlewares/middleWare";
import { PondPath } from "../../../../client";
import { IncomingMessage, ServerResponse } from "http";
declare type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
export declare const VerbHandler: <T extends IncomingMessage>(chain: MiddleWare, path: PondPath, method: HTTPMethod, handler: (req: T, res: ServerResponse, next: NextFunction) => void) => void;
