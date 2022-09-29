import { Chain, HtmlSafeString } from "../http";
import { PondResponse } from "../utils";
import { LiveComponent, LiveRouter, LiveSocket } from "./component";
import { Channel, PondChannel } from "../socket";
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
    private readonly _path;
    private readonly _base;
    private readonly _parentId;
    private readonly _componentId;
    private readonly _sockets;
    private readonly _component;
    private readonly _innerManagers;
    private readonly _pond;
    private readonly _chain;
    private readonly _htmlPath;
    constructor(path: string, component: LiveComponent, props: IComponentManagerProps);
    render(url: string, clientId: string, router: LiveRouter): Promise<RenderedComponent | null>;
    handleEvent(event: any, clientId: string, router: LiveRouter, res: PondResponse): Promise<void>;
    handleRendered(clientId: string, router: LiveRouter, res: PondResponse, channel: Channel): Promise<void>;
    handleInfo(info: any, socket: LiveSocket<any>, router: LiveRouter, res: PondResponse): Promise<void>;
    handleUnmount(clientId: string): Promise<void>;
    private _renderHtml;
    private _onEvent;
    private _pushToClient;
    private _renderComponent;
    private _initialiseHTTPManager;
    private _initialiseSocketManager;
    private _initialiseManager;
}
export {};
