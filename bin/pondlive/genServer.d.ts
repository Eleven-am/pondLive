import { Server } from "http";
import { Chain } from "../pondserver";
import { PondSocket as PondServer } from "../pondsocket";
import { Route } from "./component/liveComponent";
import { PondLiveChannelManager } from "./component/pondLiveChannel";
import { ContextProvider } from "./contextManager";
interface ServerProps {
    secret?: string;
    cookie?: string;
    pondPath?: string;
    pondSocket?: PondServer;
    htmlPath?: string;
    providers?: ContextProvider[];
}
export declare const GenerateLiveServer: (routes: Route[], server: Server, chain: Chain, props?: ServerProps) => {
    pondServer: PondServer;
    manager: PondLiveChannelManager;
};
export {};
