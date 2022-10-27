import {Route} from "../../component";
import {ContextProvider} from "../../broadcasters";
import {Authorizer} from "../auth/authenticate";
import {PondPath} from "@eleven-am/pondsocket/base";
import {Endpoint, EndpointHandler} from "@eleven-am/pondsocket";

export interface PondLiveServerOptions {
    secret?: string;
    cookie?: string;
    staticPath?: string;
    providers?: ContextProvider[];
    authenticator?: Authorizer;
    pondPath?: string;
    uploadPath?: string;
}

export interface CookieOptions {
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    expires?: Date;
    maxAge?: number;
    sameSite?: boolean | 'lax' | 'strict' | 'none';
}

declare global {
    namespace Express {
        export interface Request {
            auth: {
                token: string | null;
                clientId: string | null;
            }
        }

        export interface Response {
            html(html: string): void;
            setCookie(name: string, value: string, options?: CookieOptions): void;
        }

        export interface Application {
            usePondLive(routes: Route[], options: PondLiveServerOptions): void;

            upgrade(path: PondPath, handler: EndpointHandler): Endpoint
        }
    }
}
