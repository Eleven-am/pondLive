/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
import { NextFunction } from "../middleWare";
declare type IFileRouter = (absolutePath: string) => (request: IncomingMessage, response: ServerResponse, next: NextFunction) => void;
export declare const FileRouter: IFileRouter;
