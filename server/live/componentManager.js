"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentManager = void 0;
const clientRouter_1 = require("./component/clientRouter");
const liveSocket_1 = require("./component/liveSocket");
const liveRouter_1 = require("./component/liveRouter");
const fs = __importStar(require("fs"));
const utils_1 = require("../utils");
const http_1 = require("../http");
const enums_1 = require("../enums");
class ComponentManager {
    _path;
    _base;
    _parentId;
    _componentId;
    _sockets;
    _component;
    _innerManagers;
    _pond;
    _pondLive;
    _chain;
    _htmlPath;
    constructor(path, component, props) {
        this._base = new utils_1.BaseClass();
        this._path = path;
        this._parentId = props.parentId;
        this._componentId = this._base.nanoId();
        this._component = component;
        this._pond = props.pond;
        this._chain = props.chain;
        this._sockets = new utils_1.PondBase();
        this._initialiseManager();
        this._htmlPath = props.htmlPath;
        this._pondLive = props.pondLive;
        this._innerManagers = component.routes.map(route => new ComponentManager(`${path}${route.path}`, new route.Component(), {
            parentId: this._componentId,
            pond: this._pond,
            chain: this._chain,
            htmlPath: props.htmlPath,
            pondLive: props.pondLive
        }));
    }
    async render(data, clientId, router) {
        return await this._execute(async () => {
            let innerHtml = null;
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
            if (router.sentResponse)
                return null;
            const renderRoutes = () => (0, clientRouter_1.clientRouter)(this._componentId, innerHtml?.path || '', innerHtml?.rendered || (0, http_1.html) ``);
            let document = this._sockets.find(c => c.socket.clientId === clientId);
            if (!document)
                document = this._sockets.createDocument(doc => {
                    return {
                        socket: new liveSocket_1.LiveSocket(clientId, this._pondLive, this, doc.removeDoc.bind(doc)),
                        rendered: (0, http_1.html) ``,
                        classes: {}
                    };
                });
            else if (document.doc.socket)
                document.doc.socket.downgrade();
            const mountContext = {
                params: data.params,
                path: data.address,
                query: data.query
            };
            if (this._component.mount)
                await this._component.mount(mountContext, document.doc.socket, router);
            if (document.doc.socket) {
                const rendered = this._renderComponent(document, renderRoutes);
                return {
                    path: this._componentId,
                    rendered: rendered
                };
            }
            return null;
        });
    }
    async handleEvent(event, clientId, router, res) {
        await this._onEvent(clientId, router, res, 'updated', async (socket) => {
            if (this._component.onEvent)
                await this._component.onEvent(event, socket.context, socket, router);
        });
    }
    async handleRendered(clientId, router, res, channel) {
        await this._onEvent(clientId, router, res, 'rendered', async (socket) => {
            socket.upgradeToWebsocket(channel);
            if (this._component.onRendered)
                await this._component.onRendered(socket.context, socket, router);
        });
    }
    async handleInfo(info, socket, router, res) {
        await this._execute(async () => {
            const document = this._sockets.find(c => c.socket.clientId === socket.clientId);
            if (!document)
                return socket.destroy();
            if (this._component.onInfo)
                await this._component.onInfo(info, socket.context, socket, router);
            this._pushToClient(router, document, 'updated', res);
        });
    }
    async handleUnmount(clientId) {
        await this._execute(async () => {
            const socket = this._sockets.find(c => c.socket.clientId === clientId);
            if (!socket)
                return;
            if (this._component.onUnmount)
                await this._component.onUnmount(socket.doc.socket.context, socket.doc.socket);
            if (!socket.doc.socket.isWebsocket)
                setTimeout(() => {
                    if (!socket.doc.socket.isWebsocket)
                        socket.doc.socket.destroy();
                }, 10000);
            else
                socket.removeDoc();
        });
    }
    _renderHtml(renderedHtml, token, headers) {
        return new Promise((resolve) => {
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
                                    <script>window.flashMessage = "${headers.flashMessage}";</script>
                                </head>
                                <body>
                                    ${renderedHtml.toString()}
                                    <script src="/pondLive.js" defer=""></script>
                                </body>
                            </html>`);
                resolve(data.replace(/<title>(.*?)<\/title>/, ` <title>${headers.pageTitle || 'PondLive'}</title>
                        <script>window.token = "${token}";</script>
                        <script>window.flashMessage = "${headers.flashMessage}";</script>`)
                    .replace('<body>', `<body>
                                    ${renderedHtml.toString()}
                                    <script src="/pondLive.js" defer=""></script>
                               `));
            });
        });
    }
    async _onEvent(clientId, router, res, responseEvent, callback) {
        await this._execute(async () => {
            let document = this._sockets.find(c => c.socket.clientId === clientId);
            if (!document)
                throw new utils_1.PondError('Client not found', 404, clientId);
            await callback(document.doc.socket);
            this._pushToClient(router, document, responseEvent, res);
        });
    }
    _pushToClient(router, document, responseEvent, res) {
        this._execute(() => {
            if (router.sentResponse)
                return;
            const renderRoutes = () => (0, clientRouter_1.clientRouter)(this._componentId, 'BREAK', (0, http_1.html) ``);
            const previousRender = document.doc.rendered;
            const renderContext = this._renderComponent(document, renderRoutes);
            const htmlData = (0, clientRouter_1.clientRouter)(this._parentId, this._componentId, renderContext);
            if (responseEvent === 'updated') {
                const previous = (0, clientRouter_1.clientRouter)(this._parentId, this._componentId, previousRender);
                const difference = previous.differentiate(htmlData);
                if (this._base.isObjectEmpty(difference))
                    return;
                res.send(responseEvent, { rendered: difference, path: this._componentId, headers: router.headers });
            }
            else
                res.send(responseEvent, {
                    rendered: htmlData.getParts(),
                    path: this._componentId,
                    headers: router.headers
                });
        });
    }
    _renderComponent(document, renderRoutes) {
        return this._execute(() => {
            const renderContext = {
                context: document.doc.socket.context,
                renderRoutes
            };
            const css = (0, http_1.CssGenerator)(this._parentId);
            const styleObject = this._component.manageStyles ? this._component.manageStyles(document.doc.socket.context, css) : {
                string: (0, http_1.html) ``,
                classes: {}
            };
            const rendered = this._component.render(renderContext, styleObject.classes);
            const finalHtml = (0, http_1.html) `${styleObject.string}${rendered}`;
            document.updateDoc({
                socket: document.doc.socket,
                rendered: finalHtml,
            });
            return finalHtml;
        });
    }
    _initialiseHTTPManager() {
        this._chain.use(async (req, res, next) => {
            await this._execute(async () => {
                const csrfToken = req.headers['x-csrf-token'];
                const method = req.method || '';
                if (method === 'GET' && req.clientId && req.token && req.url) {
                    const eventRequest = this._base.getLiveRequest(this._path, req.url);
                    const resolver = this._base.generateEventRequest(this._path, req.url);
                    let htmlData = null;
                    const router = new liveRouter_1.LiveRouter(res);
                    if (resolver && csrfToken === req.token) {
                        htmlData = await this.render(resolver, req.clientId, router);
                        if (router.sentResponse)
                            return;
                    }
                    else if (eventRequest && !csrfToken) {
                        htmlData = await this.render(eventRequest, req.clientId, router);
                        if (router.sentResponse)
                            return;
                    }
                    else if (csrfToken !== req.token && resolver) {
                        res.statusCode = 403;
                        res.statusMessage = 'Invalid CSRF Token';
                        res.setHeader('Content-Type', 'application/json');
                        return res.end(JSON.stringify({
                            error: 'Invalid CSRF token'
                        }));
                    }
                    if (htmlData) {
                        if (csrfToken) {
                            const headers = router.headers;
                            if (headers.pageTitle)
                                res.setHeader('x-page-title', headers.pageTitle);
                            if (headers.flashMessage)
                                res.setHeader('x-flash-message', headers.flashMessage);
                            res.setHeader('Content-Type', 'text/html');
                            res.setHeader('x-router-container', '#' + this._parentId);
                            const html = (0, clientRouter_1.clientRouter)(this._parentId, htmlData.path, htmlData.rendered);
                            return res.end(html.toString());
                        }
                        else {
                            const headers = router.headers;
                            res.setHeader('Content-Type', 'text/html');
                            const html = (0, clientRouter_1.clientRouter)(this._parentId, htmlData.path, htmlData.rendered);
                            const htmlString = await this._renderHtml(html, req.token, headers);
                            return res.end(htmlString);
                        }
                    }
                }
                next();
            });
        });
    }
    _initialiseSocketManager() {
        this._pond.on(`mount/${this._componentId}`, async (req, res, channel) => {
            await this._execute(async () => {
                const router = new liveRouter_1.LiveRouter(res);
                await this.handleRendered(req.client.clientAssigns.clientId, router, res, channel);
                channel.subscribe(data => {
                    if (data.action === enums_1.ServerActions.PRESENCE && data.event === 'LEAVE_CHANNEL')
                        this.handleUnmount(req.client.clientAssigns.clientId);
                });
            });
        });
        this._pond.on(`update/${this._componentId}`, async (req, res, channel) => {
            const router = new liveRouter_1.LiveRouter(res);
            await this.handleRendered(req.client.clientAssigns.clientId, router, res, channel);
        });
        this._pond.on(`event/${this._componentId}`, async (req, res) => {
            const router = new liveRouter_1.LiveRouter(res);
            await this.handleEvent(req.message, req.client.clientAssigns.clientId, router, res);
        });
        this._pond.on(`unmount/${this._componentId}`, async (req) => {
            await this.handleUnmount(req.client.clientAssigns.clientId);
        });
    }
    _initialiseManager() {
        this._initialiseHTTPManager();
        this._initialiseSocketManager();
    }
    _execute(callback) {
        try {
            return callback();
        }
        catch (error) {
            if (error instanceof utils_1.PondError)
                throw error;
            else
                throw new utils_1.PondError('Internal Server Error', 500, error);
        }
    }
}
exports.ComponentManager = ComponentManager;
