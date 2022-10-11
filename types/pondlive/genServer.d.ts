import { Server } from "http";
import { Chain } from "../pondserver";
import { PondSocket as PondServer } from "../pondsocket";
import { Route } from "./component/liveComponent";
import { ContextProvider } from "./broadcasters/contextManager";
interface ServerProps {
    secret?: string;
    cookie?: string;
    pondPath?: string;
    pondSocket?: PondServer;
    htmlPath?: string;
    providers?: ContextProvider[];
}

export declare const GenerateLiveServer: (routes: Route[], server: Server, chain: Chain, props?: ServerProps) => PondServer;
export {};
