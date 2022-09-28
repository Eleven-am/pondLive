import { LiveSocket } from "./liveSocket";
import { HtmlSafeString } from "../../http/helpers/parser/parser";
import { LiveRouter } from "./liveRouter";
import { Constructor } from "../../../../client";
export interface Route {
    path: string;
    Component: Constructor<LiveComponent>;
}
export interface MountContext {
    path: string;
    params: Record<string, string>;
    query: Record<string, string>;
}
export interface RenderContext<LiveContext> {
    context: Readonly<LiveContext>;
    renderRoutes: () => HtmlSafeString;
}
export declare type CSSOutput = {
    string: HtmlSafeString;
    classes: Record<string, string>;
};
export declare type CSSGenerator = (statics: TemplateStringsArray, ...dynamics: unknown[]) => CSSOutput;
export interface LiveComponent<LiveContext = any, LiveEvent = any, LiveInfo = any> {
    routes: Route[];
    manageStyles?(context: LiveContext, css: CSSGenerator): CSSOutput;
    mount?(context: MountContext, socket: LiveSocket<LiveContext>, router: LiveRouter): void | Promise<void>;
    onRendered?(context: Readonly<LiveContext>, socket: LiveSocket<LiveContext>, router: LiveRouter): void | Promise<void>;
    onEvent?(event: LiveEvent, context: Readonly<LiveContext>, socket: LiveSocket<LiveContext>, router: LiveRouter): void | Promise<void>;
    onInfo?(info: LiveInfo, context: Readonly<LiveContext>, socket: LiveSocket<LiveContext>, router: LiveRouter): void | Promise<void>;
    onUnmount?(context: Readonly<LiveContext>): void | Promise<void>;
    render(context: RenderContext<LiveContext>, classes: Record<string, string>): HtmlSafeString;
}
