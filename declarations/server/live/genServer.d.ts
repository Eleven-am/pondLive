import { Server } from "http";
import { Chain } from "../http/helpers/middlewares/middleWare";
import { Server as PondServer } from "../socket/server";
import { Route } from "./component/liveComponent";
interface ServerProps {
    secret?: string;
    cookie?: string;
    pondPath?: string;
    pondSocket?: PondServer;
    htmlPath?: string;
}
export declare const GenerateLiveServer: (routes: Route[], server: Server, chain: Chain, props?: ServerProps | undefined) => PondServer;
export {};
