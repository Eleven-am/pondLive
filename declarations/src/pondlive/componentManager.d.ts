import { LiveSocket } from "./component/liveSocket";
import { LiveRouter } from "./component/liveRouter";
import { PondLiveChannelManager } from "./component/pondLiveChannel";
import { Chain, HtmlSafeString } from "../pondserver";
import { Resolver } from "../pondbase";
import { Channel, PondChannel, PondResponse } from "../pondsocket";
export interface IComponentManagerProps {
    parentId: string;
    pond: PondChannel;
    chain: Chain;
    pondLive: PondLiveChannelManager;
    htmlPath?: string;
}
interface RenderedComponent {
    path: string;
    rendered: HtmlSafeString;
}
export declare class ComponentManager {
    render(data: Resolver, clientId: string, router: LiveRouter): Promise<RenderedComponent | null>;
    handleEvent(event: any, clientId: string, router: LiveRouter, res: PondResponse): Promise<void>;
    handleRendered(clientId: string, router: LiveRouter, res: PondResponse, channel: Channel): Promise<void>;
    handleInfo(info: any, socket: LiveSocket<any>, router: LiveRouter, res: PondResponse): Promise<void>;
    handleUnmount(clientId: string): Promise<void>;
}
