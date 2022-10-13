/// <reference types="node" />
import { MiddleWareFunction } from "../middleWare";
import { IncomingMessage } from "http";;
export declare function BodyParserMiddleware(): MiddleWareFunction;
export declare function JsonBodyParserMiddleware(): MiddleWareFunction;
