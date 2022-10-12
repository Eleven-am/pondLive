"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentManager = void 0;
var clientRouter_1 = require("./component/clientRouter");
var liveSocket_1 = require("./component/liveSocket");
var liveRouter_1 = require("./component/liveRouter");
var fs = __importStar(require("fs"));
var pondserver_1 = require("../pondserver");
var pondbase_1 = require("../pondbase");
var pondsocket_1 = require("../pondsocket");
var ComponentManager = /** @class */ (function () {
    function ComponentManager(path, component, props) {
        var _this = this;
        this._base = new pondbase_1.BaseClass();
        this._path = path.replace(/\/{2,}/g, '/');
        this._parentId = props.parentId;
        this.componentId = this._base.nanoId();
        this.component = component;
        this._pond = props.pond;
        this._chain = props.chain;
        this._sockets = new pondbase_1.SimpleBase();
        this._initialiseManager();
        this._htmlPath = props.htmlPath;
        this._secret = props.secret;
        var contexts = props.providers.concat(this.component.providers || []);
        if (this.component.onContextChange)
            contexts.forEach(function (context) { return context.subscribe(_this); });
        this._providers = contexts;
        this._innerManagers = (component.routes || []).map(function (route) { return new ComponentManager("".concat(path).concat(route.path), new route.Component(), {
            parentId: _this.componentId,
            pond: _this._pond,
            chain: _this._chain,
            htmlPath: props.htmlPath,
            providers: contexts,
            secret: props.secret
        }); });
    }
    ComponentManager.prototype.render = function (data, clientId, router) {
        return __awaiter(this, void 0, void 0, function () {
            var document, mountContext, innerHtml, _a, _b, manager, event_1, rendered_1, e_1_1, renderRoutes, socket, rendered;
            var e_1, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        document = this._sockets.getOrCreate(clientId, function (doc) {
                            return {
                                socket: new liveSocket_1.LiveSocket(clientId, _this, doc.removeDoc.bind(doc)),
                                rendered: (0, pondserver_1.html)(templateObject_1 || (templateObject_1 = __makeTemplateObject([""], [""]))),
                                timer: null,
                            };
                        });
                        this._clearShutDown(document);
                        document.doc.socket.downgrade();
                        mountContext = {
                            params: data.params,
                            path: data.address,
                            query: data.query
                        };
                        if (!this.component.mount) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.component.mount(mountContext, document.doc.socket, router)];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        innerHtml = null;
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 8, 9, 10]);
                        _a = __values(this._innerManagers), _b = _a.next();
                        _d.label = 4;
                    case 4:
                        if (!!_b.done) return [3 /*break*/, 7];
                        manager = _b.value;
                        event_1 = this._base.getLiveRequest(manager._path, data.address);
                        if (!event_1) return [3 /*break*/, 6];
                        return [4 /*yield*/, manager.render(event_1, clientId, router)];
                    case 5:
                        rendered_1 = _d.sent();
                        if (rendered_1) {
                            innerHtml = rendered_1;
                            return [3 /*break*/, 7];
                        }
                        _d.label = 6;
                    case 6:
                        _b = _a.next();
                        return [3 /*break*/, 4];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_1_1 = _d.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 10:
                        if (router.sentResponse)
                            return [2 /*return*/, null];
                        renderRoutes = function () { return (0, clientRouter_1.clientRouter)(_this.componentId, (innerHtml === null || innerHtml === void 0 ? void 0 : innerHtml.path) || '', (innerHtml === null || innerHtml === void 0 ? void 0 : innerHtml.rendered) || (0, pondserver_1.html)(templateObject_2 || (templateObject_2 = __makeTemplateObject([""], [""])))); };
                        socket = document.doc.socket;
                        this._providers.forEach(function (context) { return context.mount(socket, _this.componentId); });
                        return [4 /*yield*/, this._renderComponent(document, renderRoutes)];
                    case 11:
                        rendered = _d.sent();
                        return [2 /*return*/, {
                                path: this.componentId,
                                rendered: rendered
                            }];
                }
            });
        });
    };
    ComponentManager.prototype.handleEvent = function (event, clientId, router, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._onEvent(clientId, router, res, 'updated', function (socket) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, ((_a = this.component.onEvent) === null || _a === void 0 ? void 0 : _a.call(socket.context, event, socket, router))];
                                    case 1:
                                        _b.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ComponentManager.prototype.handleRendered = function (clientId, router, res, channel) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._onEvent(clientId, router, res, 'rendered', function (socket) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        socket.upgradeToWebsocket(channel);
                                        return [4 /*yield*/, this._providers.forEach(function (context) { return context.mount(socket, _this.componentId); })];
                                    case 1:
                                        _b.sent();
                                        return [4 /*yield*/, ((_a = this.component.onRendered) === null || _a === void 0 ? void 0 : _a.call(socket.context, socket, router))];
                                    case 2:
                                        _b.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ComponentManager.prototype.handleInfo = function (info, socket, router, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var document;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        document = this._sockets.get(socket.clientId);
                        if (!document)
                            return [2 /*return*/, socket.destroy()];
                        this._clearShutDown(document);
                        return [4 /*yield*/, ((_a = this.component.onInfo) === null || _a === void 0 ? void 0 : _a.call(socket.context, info, socket, router))];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this._pushToClient(router, document, 'updated', res)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ComponentManager.prototype.handleContextChange = function (context, clientId) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var document, _b, router, response;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        document = this._sockets.get(clientId);
                        if (!document)
                            return [2 /*return*/, console.error('No document found for client', clientId)];
                        this._clearShutDown(document);
                        if (!document.doc.socket.isWebsocket)
                            return [2 /*return*/];
                        _b = document.doc.socket.createResponse(), router = _b.router, response = _b.response;
                        return [4 /*yield*/, ((_a = this.component.onContextChange) === null || _a === void 0 ? void 0 : _a.call(document.doc.socket.context, context, document.doc.socket, router))];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, this._pushToClient(router, document, 'updated', response)];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ComponentManager.prototype.handleUnmount = function (clientId) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var socket;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        socket = this._sockets.get(clientId);
                        if (!socket)
                            return [2 /*return*/, console.error('No socket found for client', clientId)];
                        return [4 /*yield*/, ((_a = this.component.onUnmount) === null || _a === void 0 ? void 0 : _a.call(socket.doc.socket.context, socket.doc.socket))];
                    case 1:
                        _b.sent();
                        this._shutDown(socket);
                        return [2 /*return*/];
                }
            });
        });
    };
    ComponentManager.prototype._renderHtml = function (renderedHtml, headers) {
        var _this = this;
        return new Promise(function (resolve) {
            fs.readFile(_this._htmlPath || '', "utf8", function (err, data) {
                if (err)
                    return resolve("\n                            <!DOCTYPE html>\n                            <html lang=\"en\">\n                                <head>\n                                    <meta charset=\"UTF-8\">\n                                    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                                    <title>".concat(headers.pageTitle || 'PondLive', "</title>\n                                </head>\n                                <body>\n                                    ").concat(renderedHtml.toString(), "\n                                    <script src=\"/pondLive.js\" defer=\"\"></script>\n                                </body>\n                            </html>"));
                resolve(data.replace(/<title>(.*?)<\/title>/, " <title>".concat(headers.pageTitle || 'PondLive', "</title>"))
                    .replace('<body>', "<body>\n                                    ".concat(renderedHtml.toString(), "\n                                    <script src=\"/pondLive.js\" defer=\"\"></script>\n                               ")));
            });
        });
    };
    ComponentManager.prototype._onEvent = function (clientId, router, res, responseEvent, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var document;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        document = this._sockets.get(clientId);
                        if (!document)
                            throw new pondbase_1.PondError('Client not found', 404, clientId);
                        this._clearShutDown(document);
                        return [4 /*yield*/, callback(document.doc.socket)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._pushToClient(router, document, responseEvent, res)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ComponentManager.prototype._pushToClient = function (router, document, responseEvent, res) {
        return __awaiter(this, void 0, void 0, function () {
            var renderRoutes, previousRender, renderContext, htmlData, previous, difference;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (router.sentResponse)
                            return [2 /*return*/];
                        renderRoutes = function () { return (0, clientRouter_1.clientRouter)(_this.componentId, 'BREAK', (0, pondserver_1.html)(templateObject_3 || (templateObject_3 = __makeTemplateObject([""], [""])))); };
                        previousRender = document.doc.rendered;
                        return [4 /*yield*/, this._renderComponent(document, renderRoutes)];
                    case 1:
                        renderContext = _a.sent();
                        htmlData = (0, clientRouter_1.clientRouter)(this._parentId, this.componentId, renderContext);
                        if (responseEvent === 'updated') {
                            previous = (0, clientRouter_1.clientRouter)(this._parentId, this.componentId, previousRender);
                            difference = previous.differentiate(htmlData);
                            if (this._base.isObjectEmpty(difference))
                                return [2 /*return*/];
                            res.send(responseEvent, { rendered: difference, path: this.componentId, headers: router.headers });
                        }
                        else {
                            res.send(responseEvent, {
                                rendered: htmlData.getParts(),
                                path: this.componentId,
                                headers: router.headers
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ComponentManager.prototype._renderComponent = function (document, renderRoutes) {
        return __awaiter(this, void 0, void 0, function () {
            var renderContext, css, styleObject, rendered, finalHtml;
            return __generator(this, function (_a) {
                renderContext = renderRoutes;
                css = (0, pondserver_1.CssGenerator)(this._parentId);
                styleObject = this.component.manageStyles ? this.component.manageStyles.call(document.doc.socket.context, css) : {
                    string: (0, pondserver_1.html)(templateObject_4 || (templateObject_4 = __makeTemplateObject([""], [""]))),
                    classes: {}
                };
                rendered = this.component.render.call(document.doc.socket.context, renderContext, styleObject.classes);
                finalHtml = (0, pondserver_1.html)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["", "", ""], ["", "", ""])), styleObject.string, rendered);
                document.updateDoc({
                    socket: document.doc.socket,
                    rendered: finalHtml,
                    timer: document.doc.timer
                });
                return [2 /*return*/, finalHtml];
            });
        });
    };
    ComponentManager.prototype._initialiseHTTPManager = function () {
        var _this = this;
        this._chain.use(function (req, response, next) { return __awaiter(_this, void 0, void 0, function () {
            var csrfToken, method, eventRequest, resolver, htmlData, res, router, data, headers, html_1, headers, html_2, htmlString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        csrfToken = req.headers['x-csrf-token'];
                        method = req.method || '';
                        if (!(method === 'GET' && req.clientId && req.token && req.url)) return [3 /*break*/, 8];
                        eventRequest = this._base.getLiveRequest(this._path, req.url);
                        resolver = this._base.generateEventRequest(this._path, req.url);
                        htmlData = null;
                        res = new pondserver_1.PondHTTPResponse(response);
                        router = new liveRouter_1.LiveRouter(res);
                        if (!(eventRequest && !csrfToken)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.render(eventRequest, req.clientId, router)];
                    case 1:
                        htmlData = _a.sent();
                        if (router.sentResponse)
                            return [2 /*return*/];
                        return [3 /*break*/, 5];
                    case 2:
                        if (!(resolver && csrfToken)) return [3 /*break*/, 5];
                        data = this._base.decrypt(this._secret, csrfToken);
                        if (!(data && data.clientId === req.clientId)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.render(resolver, req.clientId, router)];
                    case 3:
                        htmlData = _a.sent();
                        if (router.sentResponse)
                            return [2 /*return*/];
                        return [3 /*break*/, 5];
                    case 4:
                        res.status(403, 'Invalid CSRF Token')
                            .json({
                            error: 'Invalid CSRF token'
                        });
                        _a.label = 5;
                    case 5:
                        if (!htmlData) return [3 /*break*/, 8];
                        if (!csrfToken) return [3 /*break*/, 6];
                        headers = router.headers;
                        if (headers.pageTitle)
                            res.setHeader('x-page-title', headers.pageTitle);
                        if (headers.flashMessage)
                            res.setHeader('x-flash-message', headers.flashMessage);
                        res.setHeader('x-router-container', '#' + this._parentId);
                        html_1 = (0, clientRouter_1.clientRouter)(this._parentId, htmlData.path, htmlData.rendered);
                        return [2 /*return*/, res.html(html_1.toString())];
                    case 6:
                        headers = router.headers;
                        html_2 = (0, clientRouter_1.clientRouter)(this._parentId, htmlData.path, htmlData.rendered);
                        return [4 /*yield*/, this._renderHtml(html_2, headers)];
                    case 7:
                        htmlString = _a.sent();
                        return [2 /*return*/, res.html(htmlString)];
                    case 8:
                        next();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    ComponentManager.prototype._initialiseSocketManager = function () {
        var _this = this;
        var subscription = null;
        this._pond.on("mount/".concat(this.componentId), function (req, res, channel) { return __awaiter(_this, void 0, void 0, function () {
            var router;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        router = new liveRouter_1.LiveRouter(res);
                        return [4 /*yield*/, this.handleRendered(req.client.clientAssigns.clientId, router, res, channel)];
                    case 1:
                        _a.sent();
                        subscription = channel.subscribe(function (data) {
                            if (data.action === pondsocket_1.ServerActions.PRESENCE && data.event === 'LEAVE_CHANNEL')
                                _this.handleUnmount(req.client.clientAssigns.clientId);
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        this._pond.on("update/".concat(this.componentId), function (req, res, channel) { return __awaiter(_this, void 0, void 0, function () {
            var router, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        router = new liveRouter_1.LiveRouter(res);
                        return [4 /*yield*/, this.handleRendered(req.client.clientAssigns.clientId, router, res, channel)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        throw e_2;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        this._pond.on("event/".concat(this.componentId), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var router, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        router = new liveRouter_1.LiveRouter(res);
                        return [4 /*yield*/, this.handleEvent(req.message, req.client.clientAssigns.clientId, router, res)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_3 = _a.sent();
                        throw e_3;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        this._pond.on("unmount/".concat(this.componentId), function (req) { return __awaiter(_this, void 0, void 0, function () {
            var e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.handleUnmount(req.client.clientAssigns.clientId)];
                    case 1:
                        _a.sent();
                        if (subscription)
                            subscription.unsubscribe();
                        return [3 /*break*/, 3];
                    case 2:
                        e_4 = _a.sent();
                        throw e_4;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    ComponentManager.prototype._initialiseManager = function () {
        this._initialiseHTTPManager();
        this._initialiseSocketManager();
    };
    ComponentManager.prototype._shutDown = function (context) {
        if (context.doc.timer)
            clearTimeout(context.doc.timer);
        var timer = setTimeout(function () {
            context.doc.socket.destroy();
        }, 1000);
        context.updateDoc({
            socket: context.doc.socket,
            rendered: context.doc.rendered,
            timer: timer
        });
    };
    ComponentManager.prototype._clearShutDown = function (context) {
        if (context.doc.timer) {
            clearTimeout(context.doc.timer);
            context.updateDoc({
                socket: context.doc.socket,
                rendered: context.doc.rendered,
                timer: null
            });
        }
    };
    return ComponentManager;
}());
exports.ComponentManager = ComponentManager;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
