import {LiveComponent, RenderContext} from "./component/liveComponent";
import {clientRouter} from "./component/clientRouter";
import {LiveSocket} from "./component/liveSocket";
import {LiveRouter, RouterHeaders} from "./component/liveRouter";
import * as fs from "fs";
import {PondLiveChannelManager} from "./component/pondLiveChannel";
import {AuthenticatedRequest, Chain, CssGenerator, html, HtmlSafeString, PondHTTPResponse} from "../pondserver";
import {BaseClass, PondBase, PondDocument, PondError, Resolver} from "../pondbase";
import {Channel, PondChannel, PondResponse, ServerActions} from "../pondsocket";
import {ContextProvider} from "./contextManager";

export interface IComponentManagerProps {
    parentId: string;
    pond: PondChannel;
    chain: Chain;
    pondLive: PondLiveChannelManager
    htmlPath?: string;
    providers: ContextProvider[];
}

interface RenderedComponent {
    path: string;
    rendered: HtmlSafeString;
}

interface PondBaseContext {
    socket: LiveSocket<any>;
    rendered: HtmlSafeString;
    timer: NodeJS.Timeout | null;
}

export class ComponentManager {
    private readonly _path: string;
    private readonly _base: BaseClass;
    private readonly _parentId: string;
    private readonly _componentId: string;
    private readonly _sockets: PondBase<PondBaseContext>;
    private readonly _component: LiveComponent;
    private readonly _innerManagers: ComponentManager[];
    private readonly _pond: PondChannel;
    private readonly _pondLive: PondLiveChannelManager;
    private readonly _chain: Chain;
    private readonly _htmlPath: string | undefined;
    private readonly _providers: ContextProvider[]

    constructor(path: string, component: LiveComponent, props: IComponentManagerProps) {
        this._base = new BaseClass();
        this._path = path.replace('//', '/');
        this._parentId = props.parentId;
        this._componentId = this._base.nanoId();
        this._component = component;
        this._pond = props.pond;
        this._chain = props.chain;
        this._sockets = new PondBase<PondBaseContext>();
        this._initialiseManager();
        this._htmlPath = props.htmlPath;
        this._pondLive = props.pondLive;

        const contexts = props.providers.concat(this._component.providers || []);

        if (this._component.onContextChange)
            contexts.forEach(context => context.subscribe(this));

        this._providers = contexts;

        this._innerManagers = component.routes.map(route => new ComponentManager(`${path}${route.path}`, new route.Component(), {
            parentId: this._componentId,
            pond: this._pond,
            chain: this._chain,
            htmlPath: props.htmlPath,
            pondLive: props.pondLive,
            providers: contexts
        }));
    }

    public async render(data: Resolver, clientId: string, router: LiveRouter): Promise<RenderedComponent | null> {
        let document = this._sockets.find(c => c.socket.clientId === clientId)
        if (!document)
            document = this._sockets.createDocument(doc => {
                return {
                    socket: new LiveSocket(clientId, this._pondLive, this, doc.removeDoc.bind(doc)),
                    rendered: html``,
                    timer: null,
                }
            });

        else if (document.doc.socket) {
            document.doc.timer && clearTimeout(document.doc.timer);
            document.doc.socket.downgrade();
            document.updateDoc({
                ...document.doc,
                timer: null
            });
        }

        const mountContext = {
            params: data.params,
            path: data.address,
            query: data.query
        }

        if (this._component.mount)
            await this._component.mount(mountContext, document.doc.socket, router);

        let innerHtml: RenderedComponent | null = null;
        for (const manager of this._innerManagers) {
            const event = this._base.getLiveRequest(manager._path, data.address);
            if (event) {
                const rendered = await manager.render(event, clientId, router);
                if (rendered) {
                    innerHtml = rendered;
                    break;
                }
            }
        }

        if (router.sentResponse) return null;

        const renderRoutes = () => clientRouter(this._componentId, innerHtml?.path || '', innerHtml?.rendered || html``);

        if (document.doc.socket) {
            const socket = document.doc.socket;
            await this._manageContext(socket, router);
            const rendered = await this._renderComponent(document, renderRoutes);

            return {
                path: this._componentId,
                rendered: rendered
            }
        }

        return null;
    }

    public async handleEvent(event: any, clientId: string, router: LiveRouter, res: PondResponse): Promise<void> {
        await this._onEvent(clientId, router, res, 'updated', async (socket) => {
            if (this._component.onEvent)
                await this._component.onEvent(event, socket.context, socket, router);
        });
    }

    public async handleRendered(clientId: string, router: LiveRouter, res: PondResponse, channel: Channel): Promise<void> {
        await this._onEvent(clientId, router, res, 'rendered', async (socket) => {
            socket.upgradeToWebsocket(channel);
            await this._manageContext(socket, router);
            if (this._component.onRendered)
                await this._component.onRendered(socket.context, socket, router);
        });
    }

    public async handleInfo(info: any, socket: LiveSocket<any>, router: LiveRouter, res: PondResponse): Promise<void> {
        const document = this._sockets.find(c => c.socket.clientId === socket.clientId);
        if (!document)
            return socket.destroy();

        if (this._component.onInfo)
            await this._component.onInfo(info, socket.context, socket, router);

        await this._pushToClient(router, document, 'updated', res);
    }

    public async handleContextChange(context: any, contextName: string,  clientId: string) {
        const document = this._sockets.find(c => c.socket.clientId === clientId);
        if (!document || !document.doc.socket.isWebsocket)
            return;

        const {router, response} = document.doc.socket.createResponse();
        if (this._component.onContextChange)
            await this._component.onContextChange(contextName, context, document.doc.socket.context, document.doc.socket, router);

        await this._pushToClient(router, document, 'updated', response);
    }

    public async handleUnmount(clientId: string): Promise<void> {
        const socket = this._sockets.find(c => c.socket.clientId === clientId);
        if (!socket) return;

        if (this._component.onUnmount)
            await this._component.onUnmount(socket.doc.socket.context, socket.doc.socket);

        const timer = setTimeout(() => {
            socket.doc.socket.destroy();
        }, 10000);

        socket.updateDoc({
            ...socket.doc,
            timer
        });
    }

    private _renderHtml(renderedHtml: HtmlSafeString, token: string, headers: RouterHeaders): Promise<string> | string {
        return new Promise<string>((resolve) => {
            fs.readFile(this._htmlPath || '', "utf8", (err, data) => {
                if (err)
                    return resolve(`
                            <!DOCTYPE html>
                            <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>${headers.pageTitle || 'PondLive'}</title>
                                    <script>window.token = "${token}";</script>
                                </head>
                                <body>
                                    ${renderedHtml.toString()}
                                    <script src="/pondLive.js" defer=""></script>
                                </body>
                            </html>`);

                resolve(
                    data.replace(/<title>(.*?)<\/title>/, ` <title>${headers.pageTitle || 'PondLive'}</title>
                        <script>window.token = "${token}";</script>`)
                        .replace('<body>', `<body>
                                    ${renderedHtml.toString()}
                                    <script src="/pondLive.js" defer=""></script>
                               `)
                );
            });
        })
    }

    private async _manageContext(socket: LiveSocket<any>, router: LiveRouter): Promise<void> {
        if (this._component.onContextChange) {
            for await (const provider of this._providers) {
                const ctx = await provider.getData(socket);
                if (ctx)
                    await this._component.onContextChange(ctx.name, ctx.data, socket.context, socket, router);
            }
        }
    }

    private async _onEvent(clientId: string, router: LiveRouter, res: PondResponse, responseEvent: string, callback: (socket: LiveSocket<any>) => Promise<void>): Promise<void> {
        let document = this._sockets.find(c => c.socket.clientId === clientId)
        if (!document)
            throw new PondError('Client not found', 404, clientId);

        if (document.doc.timer) {
            clearTimeout(document.doc.timer);
            document.updateDoc({
                ...document.doc,
                timer: null
            });
        }

        await callback(document.doc.socket);
        await this._pushToClient(router, document, responseEvent, res);
    }

    private async _pushToClient(router: LiveRouter, document: PondDocument<PondBaseContext>, responseEvent: string, res: PondResponse): Promise<void> {
        if (router.sentResponse) return;

        const renderRoutes = () => clientRouter(this._componentId, 'BREAK', html``);

        const previousRender = document.doc.rendered;
        const renderContext = await this._renderComponent(document, renderRoutes);

        const htmlData = clientRouter(this._parentId, this._componentId, renderContext);

        if (responseEvent === 'updated') {
            const previous = clientRouter(this._parentId, this._componentId, previousRender);
            const difference = previous.differentiate(htmlData);
            if (this._base.isObjectEmpty(difference)) return;
            res.send(responseEvent, {rendered: difference, path: this._componentId, headers: router.headers});

        } else
            res.send(responseEvent, {
                rendered: htmlData.getParts(),
                path: this._componentId,
                headers: router.headers
            });
    }

    private async _renderComponent(document: PondDocument<PondBaseContext>, renderRoutes: () => HtmlSafeString): Promise<HtmlSafeString> {
        const renderContext: RenderContext<any> = {
            context: document.doc.socket.context,
            renderRoutes
        }

        const css = CssGenerator(this._parentId);
        const styleObject = this._component.manageStyles ? this._component.manageStyles(document.doc.socket.context, css) : {
            string: html``,
            classes: {}
        };
        const rendered = this._component.render(renderContext, styleObject.classes);
        const finalHtml = html`${styleObject.string}${rendered}`;

        document.updateDoc({
            socket: document.doc.socket,
            rendered: finalHtml,
            timer: document.doc.timer
        })

        return finalHtml;
    }

    private _initialiseHTTPManager(): void {
        this._chain.use(async (req: AuthenticatedRequest, response, next) => {
            const csrfToken = req.headers['x-csrf-token'];
            const method = req.method || '';
            if (method === 'GET' && req.clientId && req.token && req.url) {
                const eventRequest = this._base.getLiveRequest(this._path, req.url);
                const resolver = this._base.generateEventRequest(this._path, req.url);
                let htmlData: RenderedComponent | null = null;
                const res = new PondHTTPResponse(response);
                const router = new LiveRouter(res);

                if (resolver && csrfToken === req.token) {
                    htmlData = await this.render(resolver, req.clientId, router);
                    if (router.sentResponse) return;

                } else if (eventRequest && !csrfToken) {
                    htmlData = await this.render(eventRequest, req.clientId, router);
                    if (router.sentResponse) return;

                } else if (csrfToken !== req.token && resolver) {
                    res.status(403, 'Invalid CSRF Token')
                        .json({
                            error: 'Invalid CSRF token'
                        })
                }

                if (htmlData) {
                    if (csrfToken) {
                        const headers = router.headers;
                        if (headers.pageTitle)
                            res.setHeader('x-page-title', headers.pageTitle);

                        if (headers.flashMessage)
                            res.setHeader('x-flash-message', headers.flashMessage);

                        res.setHeader('x-router-container', '#' + this._parentId);
                        const html = clientRouter(this._parentId, htmlData.path, htmlData.rendered);
                        return res.html(html.toString());

                    } else {
                        const headers = router.headers;
                        const html = clientRouter(this._parentId, htmlData.path, htmlData.rendered);
                        const htmlString = await this._renderHtml(html, req.token, headers);
                        return res.html(htmlString);
                    }
                }
            }

            next();
        });
    }

    private _initialiseSocketManager(): void {
        this._pond.on(`mount/${this._componentId}`, async (req, res, channel) => {
            const router = new LiveRouter(res);
            await this.handleRendered(req.client.clientAssigns.clientId, router, res, channel);

            channel.subscribe(data => {
                if (data.action === ServerActions.PRESENCE && data.event === 'LEAVE_CHANNEL') {
                    this.handleUnmount(req.client.clientAssigns.clientId);
                    this._providers.forEach(context => context.deleteClient(req.client.clientAssigns.clientId));
                }
            });
        });

        this._pond.on(`update/${this._componentId}`, async (req, res, channel) => {
            try {
                const router = new LiveRouter(res);
                await this.handleRendered(req.client.clientAssigns.clientId, router, res, channel);
            } catch (e) {
                throw e;
            }
        });

        this._pond.on(`event/${this._componentId}`, async (req, res) => {
            try {
                const router = new LiveRouter(res);
                await this.handleEvent(req.message, req.client.clientAssigns.clientId, router, res);
            } catch (e) {
                throw e;
            }
        });

        this._pond.on(`unmount/${this._componentId}`, async (req) => {
            try {
                await this.handleUnmount(req.client.clientAssigns.clientId);
            } catch (e) {
                throw e;
            }
        });
    }

    private _initialiseManager(): void {
        this._initialiseHTTPManager();
        this._initialiseSocketManager();
    }
}
