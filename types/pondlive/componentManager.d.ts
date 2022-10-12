import {LiveSocket} from "./component/liveSocket";
import {LiveRouter} from "./component/liveRouter";
import {HtmlSafeString} from "../pondserver";
import {Resolver} from "../pondbase";
import {Channel, PondResponse} from "../pondsocket";
import {PeakData} from "./broadcasters/contextManager";

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

