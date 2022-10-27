/// <reference types="node" />
import {IncomingHttpHeaders} from "http";

export declare type Authorizer = (request: IncomingHttpHeaders) => {
    clientId: string | null;
    token: string | null;
    setToken?: boolean;
    clearToken?: boolean;
};

