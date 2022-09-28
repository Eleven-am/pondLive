import { LiveComponent } from "./component/liveComponent";
import { PondChannel } from "../socket/pondChannel";
import { Chain } from "../http/helpers/middlewares/middleWare";
import { HtmlSafeString } from "../http/helpers/parser/parser";
import { LiveSocket } from "./component/liveSocket";
import { LiveRouter } from "./component/liveRouter";
import { PondResponse } from "../utils/pondResponse";
import { Channel } from "../socket/channel";
export interface IComponentManagerProps {
    parentId: string;
    pond: PondChannel;
    chain: Chain;
    htmlPath?: string;
}
interface RenderedComponent {
    path: string;
    rendered: HtmlSafeString;
}
export declare class ComponentManager {
    constructor(path: string, component: LiveComponent, props: IComponentManagerProps);
    render(url: string, clientId: string, router: LiveRouter): Promise<RenderedComponent | null>;
    handleEvent(event: any, clientId: string, router: LiveRouter, res: PondResponse): Promise<void>;
    handleRendered(clientId: string, router: LiveRouter, res: PondResponse, channel: Channel): Promise<void>;
    handleInfo(info: any, socket: LiveSocket<any>, router: LiveRouter, res: PondResponse): Promise<void>;
    handleUnmount(clientId: string): Promise<void>;
}
export {};
