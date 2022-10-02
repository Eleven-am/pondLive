import { Server } from "http";
import { Chain } from "../http";
import { PondSocket as PondServer } from "../socket/pondSocket";
import { Route } from "./component/liveComponent";
interface ServerProps {
    secret?: string;
    cookie?: string;
    pondPath?: string;
    pondSocket?: PondServer;
    htmlPath?: string;
}
export declare const GenerateLiveServer: (routes: Route[], server: Server, chain: Chain, props?: ServerProps) => PondServer;
export {};