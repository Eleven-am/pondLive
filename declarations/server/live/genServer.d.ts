import { Server } from "http";
import { Chain } from "../http";
import { Route } from "./component";
import { PondSocket } from "../socket";
interface ServerProps {
    secret?: string;
    cookie?: string;
    pondPath?: string;
    pondSocket?: PondSocket;
    htmlPath?: string;
}
export declare const GenerateLiverServer: (routes: Route[], server: Server, chain: Chain, props?: ServerProps) => PondSocket;
export {};
