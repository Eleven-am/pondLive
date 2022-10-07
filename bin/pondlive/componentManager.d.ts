import { LiveComponent } from "./component/liveComponent";
import { LiveSocket } from "./component/liveSocket";
import { LiveRouter } from "./component/liveRouter";
import { PondLiveChannelManager } from "./component/pondLiveChannel";
import { Chain, HtmlSafeString } from "../pondserver";
import { Resolver } from "../pondbase";
import { Channel, PondChannel, PondResponse } from "../pondsocket";
import { ContextProvider } from "./contextManager";
export interface IComponentManagerProps {
    parentId: string;
    pond: PondChannel;
    chain: Chain;
    pondLive: PondLiveChannelManager;
    htmlPath?: string;
    providers: ContextProvider[];
}
interface RenderedComponent {
    path: string;
    rendered: HtmlSafeString;
}
export declare class ComponentManager {
    private readonly _path;
    private readonly _base;
    private readonly _parentId;
    private readonly _componentId;
    private readonly _sockets;
    private readonly _component;
    private readonly _innerManagers;
    private readonly _pond;
    private readonly _pondLive;
    private readonly _chain;
    private readonly _htmlPath;
    private readonly _providers;
    constructor(path: string, component: LiveComponent, props: IComponentManagerProps);
    render(data: Resolver, clientId: string, router: LiveRouter): Promise<RenderedComponent | null>;
    handleEvent(event: any, clientId: string, router: LiveRouter, res: PondResponse): Promise<void>;
    handleRendered(clientId: string, router: LiveRouter, res: PondResponse, channel: Channel): Promise<void>;
    handleInfo(info: any, socket: LiveSocket<any>, router: LiveRouter, res: PondResponse): Promise<void>;
    handleContextChange(context: any, contextName: string, clientId: string): Promise<void>;
    handleUnmount(clientId: string): Promise<void>;
    private _renderHtml;
    private _manageContext;
    private _onEvent;
    private _pushToClient;
    private _renderComponent;
    private _initialiseHTTPManager;
    private _initialiseSocketManager;
    private _initialiseManager;
}
export {};
