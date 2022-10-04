import { LiveComponent } from "./component/liveComponent";
import { LiveSocket } from "./component/liveSocket";
import { LiveRouter } from "./component/liveRouter";
import { PondResponse, Resolver } from "../utils";
import { Chain, HtmlSafeString } from "../http";
import { Channel, PondChannel } from "../socket";
import { PondLiveChannelManager } from "./component/pondLiveChannel";
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
    constructor(path: string, component: LiveComponent, props: IComponentManagerProps);
    render(data: Resolver, clientId: string, router: LiveRouter): Promise<RenderedComponent | null>;
    handleEvent(event: any, clientId: string, router: LiveRouter, res: PondResponse): Promise<void>;
    handleRendered(clientId: string, router: LiveRouter, res: PondResponse, channel: Channel): Promise<void>;
    handleInfo(info: any, socket: LiveSocket<any>, router: LiveRouter, res: PondResponse): Promise<void>;
    handleUnmount(clientId: string): Promise<void>;
}
