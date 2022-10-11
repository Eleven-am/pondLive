import {ComponentClass} from "./component/liveComponent";
import {LiveSocket} from "./component/liveSocket";
import {LiveRouter} from "./component/liveRouter";
import {Chain, HtmlSafeString} from "../pondserver";
import {Resolver} from "../pondbase";
import {Channel, PondChannel, PondResponse} from "../pondsocket";
import {ContextProvider, PeakData} from "./broadcasters/contextManager";

export interface IComponentManagerProps {
    parentId: string;
    pond: PondChannel;
    chain: Chain;
    secret: string;
    htmlPath?: string;
    providers: ContextProvider[];
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

    handleContextChange(context: PeakData, clientId: string): Promise<void>;

    handleUnmount(clientId: string): Promise<void>;
}

export {};
