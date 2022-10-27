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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentManager = void 0;
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const parser_1 = require("./parser");
const emitters_1 = require("../emitters");
const server_1 = require("../server");
const base_1 = require("@eleven-am/pondsocket/base");
const pondsocket_1 = require("@eleven-am/pondsocket");
const baseClass_1 = require("../utils/baseClass");
class ComponentManager {
    constructor(path, component, props) {
        this._base = new baseClass_1.BaseClass();
        this._path = path.replace(/\/{2,}/g, '/');
        this._parentId = props.parentId;
        this._componentId = this._base.nanoId();
        this._component = component;
        this._pond = props.pond;
        this._chain = props.chain;
        this._sockets = new base_1.SimpleBase();
        this._initialiseManager();
        this._setupEventHandler(props.internalBus);
        this._htmlPath = props.htmlPath;
        this._secret = props.secret;
        this._uploadPath = props.uploadPath;
        this._providers = [];
        this._internalBus = props.internalBus;
        const contexts = [...component.providers, ...props.providers];
        contexts.forEach(async (context) => {
            const shouldAdd = await context.subscribe(this._componentId, this._component);
            if (!shouldAdd)
                return;
            this._providers.push(context);
        });
        this._innerManagers = (component.routes || []).map(route => new ComponentManager(`${path}${route.path}`, new route.Component(), {
            parentId: this._componentId,
            pond: this._pond,
            chain: this._chain,
            htmlPath: props.htmlPath,
            internalBus: props.internalBus,
            providers: contexts,
            secret: props.secret,
            uploadPath: props.uploadPath,
        }));
    }
    async manageSocketRender(socket, router, response, callback) {
        const document = this._sockets.get(socket.clientId);
        if (!document) {
            this._internalBus.publish({ clientId: socket.clientId, action: 'DISCONNECT' });
            socket.destroy(true);
            router.reload();
            return;
        }
        await callback(this._component);
        await this._pushToClient(router, document, 'updated', response);
    }
    async _handleUpload(uploadMessage, clientId, event) {
        const document = this._sockets.get(clientId);
        if (!document) {
            uploadMessage.files.forEach(file => file.destroy());
            this._internalBus.publish({ clientId, action: 'DISCONNECT' });
            return;
        }
        const uploadEvent = {
            type: event,
            files: uploadMessage.files,
        };
        await document.doc.socket.onUpload(uploadEvent);
    }
    async _handleUploadAuthorise(authorizer, clientId, event, res) {
        var _a;
        if (!this._component.onUploadRequest || !this._component.onUpload) {
            authorizer.sendError('Upload not supported');
            return;
        }
        const router = new emitters_1.LiveRouter(res);
        const document = this._sockets.get(clientId);
        if (!document) {
            authorizer.sendError('Client not found');
            return;
        }
        const socket = document.doc.socket;
        const eventRequest = {
            type: event, message: authorizer,
        };
        (_a = this._component.onUploadRequest) === null || _a === void 0 ? void 0 : _a.call(socket.context, eventRequest, socket, router);
        await this._pushToClient(router, document, 'updated', res);
    }
    async _render(data, clientId, router) {
        if (router.sentResponse)
            return null;
        const document = this._sockets.getOrCreate(clientId, doc => {
            return {
                socket: new emitters_1.LiveSocket(clientId, this, doc.removeDoc.bind(doc)), rendered: (0, parser_1.html) ``, timer: null,
            };
        });
        const socket = document.doc.socket;
        const mountContext = {
            params: data.params,
            path: data.address,
            query: data.query
        };
        if (this._component.mount)
            await this._component.mount(mountContext, socket, router);
        if (router.sentResponse)
            return null;
        let innerHtml = null;
        for (const manager of this._innerManagers) {
            const event = this._base.getLiveRequest(manager._path, data.address);
            if (event) {
                const rendered = await manager._render(event, clientId, router);
                if (rendered) {
                    innerHtml = rendered;
                    break;
                }
            }
        }
        this._providers.forEach(provider => socket.subscribeToContextManager(provider));
        if (router.sentResponse)
            return null;
        const renderRoutes = () => this._createRouter((innerHtml === null || innerHtml === void 0 ? void 0 : innerHtml.rendered) || (0, parser_1.html) ``, this._componentId, (innerHtml === null || innerHtml === void 0 ? void 0 : innerHtml.path) || '');
        const rendered = await this._renderComponent(document, renderRoutes);
        return {
            path: this._componentId, rendered: rendered
        };
    }
    async _handleEvent(event, clientId, router) {
        await this._onEvent(clientId, async (socket) => {
            var _a;
            await ((_a = this._component.onEvent) === null || _a === void 0 ? void 0 : _a.call(socket.context, event, socket, router));
        });
    }
    async _handleRendered(clientId, router, res, channel) {
        const event = {
            router: router, response: res
        };
        await this._onEvent(clientId, async (socket) => {
            var _a;
            socket.upgradeToWebsocket(channel);
            await ((_a = this._component.onRendered) === null || _a === void 0 ? void 0 : _a.call(socket.context, socket, router));
        }, event);
    }
    async _handleUnmount(clientId) {
        var _a;
        const socket = this._sockets.get(clientId);
        if (!socket)
            return;
        await ((_a = this._component.onUnmount) === null || _a === void 0 ? void 0 : _a.call(socket.doc.socket.context, socket.doc.socket));
        socket.doc.socket.destroy();
    }
    _renderHtml(renderedHtml, headers) {
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
                                </head>
                                <body>
                                    ${renderedHtml.toString()}
                                    <script src="/pondLive.js" defer=""></script>
                                </body>
                            </html>`);
                resolve(data.replace(/<title>(.*?)<\/title>/, ` <title>${headers.pageTitle || 'PondLive'}</title>`)
                    .replace('<body>', `<body>
                                    ${renderedHtml.toString()}
                                    <script src="/pondLive.js" defer=""></script>
                               `));
            });
        });
    }
    async _onEvent(clientId, callback, props = null) {
        let document = this._sockets.get(clientId);
        if (!document) {
            this._internalBus.publish({ clientId, action: 'DISCONNECT' });
            props === null || props === void 0 ? void 0 : props.router.reload();
            return;
        }
        await callback(document.doc.socket);
        if (!props)
            return;
        const { router, response } = props;
        if (router.sentResponse)
            return;
        await this._pushToClient(router, document, 'rendered', response);
    }
    async _pushToClient(router, document, responseEvent, res) {
        if (router.sentResponse)
            return;
        const renderRoutes = () => this._createRouter((0, parser_1.html) ``, this._componentId, 'BREAK');
        const previousRender = document.doc.rendered;
        const renderContext = await this._renderComponent(document, renderRoutes);
        const htmlData = this._createRouter(renderContext, this._parentId, this._componentId);
        if (responseEvent === 'updated') {
            const previous = this._createRouter(previousRender);
            const difference = previous.differentiate(htmlData);
            if (this._base.isObjectEmpty(difference))
                return;
            res.send(responseEvent, { rendered: difference, path: this._componentId, headers: router.headers });
        }
        else {
            res.send(responseEvent, {
                rendered: htmlData.getParts(), path: this._componentId, headers: router.headers
            });
        }
    }
    async _renderComponent(document, renderRoutes) {
        const renderContext = renderRoutes;
        const css = (0, parser_1.CssGenerator)(this._parentId);
        const styleObject = this._component.manageStyles ? this._component.manageStyles.call(document.doc.socket.context, css) : {
            string: (0, parser_1.html) ``, classes: {}
        };
        const rendered = this._component.render.call(document.doc.socket.context, renderContext, styleObject.classes);
        const finalHtml = (0, parser_1.html) `${styleObject.string}${rendered}`;
        document.updateDoc({
            socket: document.doc.socket, rendered: finalHtml
        });
        return finalHtml;
    }
    _initialiseHTTPManager() {
        this._chain.use(async (request, response, next) => {
            const extension = path_1.default.extname(request.url);
            if (extension !== '')
                return next();
            const csrfToken = request.get('x-csrf-token');
            const method = request.method;
            const { clientId, token } = request.auth;
            if (method === 'GET' && clientId && token) {
                const eventRequest = this._base.getLiveRequest(this._path, request.url);
                const resolver = this._base.generateEventRequest(this._path, request.url);
                if (resolver && csrfToken)
                    return await this._handleCSRFRequest(resolver, csrfToken, clientId, response, next);
                if (eventRequest && !csrfToken)
                    return await this._handleInitialRequest(eventRequest, clientId, response, next);
            }
            next();
        });
    }
    _initialiseSocketManager() {
        this._pond.on(`mount/${this._componentId}`, async (req, res, channel) => {
            const router = new emitters_1.LiveRouter(res);
            await this._handleRendered(req.client.clientAssigns.clientId, router, res, channel);
            const sub = channel.onPresenceChange(data => {
                if (data.action === pondsocket_1.ServerActions.PRESENCE && data.event === 'LEAVE_CHANNEL') {
                    this._handleUnmount(req.client.clientAssigns.clientId);
                    sub.unsubscribe();
                }
            });
        });
        this._pond.on(`update/${this._componentId}`, async (req, res, channel) => {
            try {
                const router = new emitters_1.LiveRouter(res);
                await this._handleRendered(req.client.clientAssigns.clientId, router, res, channel);
            }
            catch (e) {
                throw e;
            }
        });
        this._pond.on(`event/${this._componentId}`, async (req, res) => {
            try {
                const router = new emitters_1.LiveRouter(res);
                await this._handleEvent(req.message, req.client.clientAssigns.clientId, router);
            }
            catch (e) {
                throw e;
            }
        });
        this._pond.on(`unmount/${this._componentId}`, async (req) => {
            try {
                await this._handleUnmount(req.client.clientAssigns.clientId);
            }
            catch (e) {
                throw e;
            }
        });
        this._pond.on(`${this._componentId}/upload/token`, async (req, res, channel) => {
            var _a;
            if (req.message.files && req.message.files.length > 0 && ((_a = req.message.metadata) === null || _a === void 0 ? void 0 : _a.identifier) && req.message.type) {
                const files = req.message.files;
                const identifier = req.message.metadata.identifier;
                const authorizer = new server_1.UploadAuthoriseMessage(files, identifier, req.client.clientAssigns.clientId, this._uploadPath, channel);
                void this._handleUploadAuthorise(authorizer, req.client.clientAssigns.clientId, req.message.type, res);
            }
        });
    }
    _initialiseManager() {
        this._initialiseHTTPManager();
        this._initialiseSocketManager();
    }
    _setupEventHandler(pubsub) {
        if (this._component.onUpload)
            pubsub.subscribe(data => {
                if ("message" in data && (data === null || data === void 0 ? void 0 : data.message)) {
                    if (data.componentId === this._componentId)
                        this._handleUpload(data.message, data.clientId, data.event);
                }
                else if ("event" in data && (data === null || data === void 0 ? void 0 : data.event)) {
                    const document = this._sockets.get(data.clientId);
                    if (document)
                        document.doc.socket.destroy(true);
                }
            });
    }
    _createRouter(innerRoute, parentId = this._parentId, componentId = this._componentId) {
        return (0, parser_1.html) `
            <div id="${parentId}" pond-router="${componentId}">${innerRoute}</div>`;
    }
    async _handleInitialRequest(request, clientId, response, next) {
        const router = new emitters_1.LiveRouter(response);
        const htmlData = await this._render(request, clientId, router);
        if (router.sentResponse)
            return;
        if (htmlData) {
            const headers = router.headers;
            const html = this._createRouter(htmlData.rendered);
            const htmlString = await this._renderHtml(html, headers);
            response.html(htmlString);
        }
        next();
    }
    async _handleCSRFRequest(request, csrfToken, clientId, response, next) {
        const router = new emitters_1.LiveRouter(response);
        const data = this._base.decrypt(this._secret, csrfToken);
        if (!data || data.clientId !== clientId) {
            response.status(403)
                .json({
                error: 'Invalid CSRF token'
            });
            return;
        }
        const htmlData = await this._render(request, clientId, router);
        if (router.sentResponse)
            return;
        if (htmlData) {
            const headers = router.headers;
            if (headers.pageTitle)
                response.setHeader('x-page-title', headers.pageTitle);
            if (headers.flashMessage)
                response.setHeader('x-flash-message', headers.flashMessage);
            response.setHeader('x-router-container', '#' + this._parentId);
            const html = this._createRouter(htmlData.rendered);
            response.html(html.toString());
        }
        next();
    }
}
exports.ComponentManager = ComponentManager;
