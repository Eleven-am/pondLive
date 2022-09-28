"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentManager = void 0;
var baseClass_1 = require("../utils/baseClass");
var parser_1 = require("../http/helpers/parser/parser");
var clientRouter_1 = require("./component/clientRouter");
var pondBase_1 = require("../utils/pondBase");
var liveSocket_1 = require("./component/liveSocket");
var liveRouter_1 = require("./component/liveRouter");
var enums_1 = require("../enums");
var cssGenerator_1 = require("../http/helpers/parser/cssGenerator");
var fs = __importStar(require("fs"));
var ComponentManager = /** @class */ (function () {
    function ComponentManager(path, component, props) {
        var _this = this;
        this._base = new baseClass_1.BaseClass();
        this._path = path;
        this._parentId = props.parentId;
        this._componentId = this._base.nanoId();
        this._component = component;
        this._pond = props.pond;
        this._chain = props.chain;
        this._sockets = new pondBase_1.PondBase();
        this._initialiseManager();
        this._htmlPath = props.htmlPath;
        this._innerManagers = component.routes.map(function (route) { return new ComponentManager("" + path + route.path, new route.Component(), {
            parentId: _this._componentId,
            pond: _this._pond,
            chain: _this._chain,
            htmlPath: props.htmlPath
        }); });
    }
    ComponentManager.prototype.render = function (url, clientId, router) {
        return __awaiter(this, void 0, void 0, function () {
            var event, innerHtml, renderRoutes, document, mountContext, rendered;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event = this._base.getLiveRequest(this._path, url);
                        if (!event)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this._innerManagers.reduce(function (acc, manager) { return __awaiter(_this, void 0, void 0, function () {
                                var html;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, manager.render(url, clientId, router)];
                                        case 1:
                                            html = _a.sent();
                                            if (html)
                                                return [2 /*return*/, html];
                                            return [2 /*return*/, acc];
                                    }
                                });
                            }); }, Promise.resolve(null))];
                    case 1:
                        innerHtml = _a.sent();
                        if (router.sentResponse)
                            return [2 /*return*/, null];
                        renderRoutes = function () { return (0, clientRouter_1.clientRouter)(_this._componentId, (innerHtml === null || innerHtml === void 0 ? void 0 : innerHtml.path) || '', (innerHtml === null || innerHtml === void 0 ? void 0 : innerHtml.rendered) || (0, parser_1.html)(templateObject_1 || (templateObject_1 = __makeTemplateObject([""], [""])))); };
                        document = this._sockets.find(function (c) { return c.socket.clientId === clientId; });
                        if (!document)
                            document = this._sockets.createDocument(function () {
                                return {
                                    socket: new liveSocket_1.LiveSocket(clientId, _this._pond, _this),
                                    rendered: (0, parser_1.html)(templateObject_2 || (templateObject_2 = __makeTemplateObject([""], [""]))),
                                    classes: {}
                                };
                            });
                        mountContext = {
                            params: event.params,
                            path: event.address,
                            query: event.query
                        };
                        if (!this._component.mount) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._component.mount(mountContext, document.doc.socket, router)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (document.doc.socket) {
                            rendered = this._renderComponent(document, renderRoutes);
                            return [2 /*return*/, {
                                    path: this._componentId,
                                    rendered: rendered
                                }];
                        }
                        return [2 /*return*/, null];
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
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!this._component.onEvent) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this._component.onEvent(event, socket.context, socket, router)];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
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
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        socket.channel = channel;
                                        if (!this._component.onRendered) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this._component.onRendered(socket.context, socket, router)];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
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
        return __awaiter(this, void 0, void 0, function () {
            var document;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        document = this._sockets.find(function (c) { return c.socket.clientId === socket.clientId; });
                        if (!document)
                            return [2 /*return*/];
                        if (!this._component.onInfo) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._component.onInfo(info, socket.context, socket, router)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this._pushToClient(router, document, 'updated', res);
                        return [2 /*return*/];
                }
            });
        });
    };
    ComponentManager.prototype.handleUnmount = function (clientId) {
        return __awaiter(this, void 0, void 0, function () {
            var socket;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        socket = this._sockets.find(function (c) { return c.socket.clientId === clientId; });
                        if (!socket)
                            return [2 /*return*/];
                        if (!this._component.onUnmount) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._component.onUnmount(socket.doc.socket.context)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        socket.removeDoc();
                        return [2 /*return*/];
                }
            });
        });
    };
    ComponentManager.prototype._renderHtml = function (renderedHtml, token, headers) {
        var _this = this;
        return new Promise(function (resolve) {
            fs.readFile(_this._htmlPath || '', "utf8", function (err, data) {
                if (err)
                    return resolve("\n                            <!DOCTYPE html>\n                            <html lang=\"en\">\n                                <head>\n                                    <meta charset=\"UTF-8\">\n                                    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                                    <title>" + (headers.pageTitle || 'PondLive') + "</title>\n                                    <script>window.token = \"" + token + "\";</script>\n                                    <script>window.flashMessage = \"" + headers.flashMessage + "\";</script>\n                                </head>\n                                <body>\n                                    " + renderedHtml.toString() + "\n                                    <script src=\"/pondLive.js\" defer=\"\"></script>\n                                </body>\n                            </html>");
                resolve(data.replace(/<title>(.*?)<\/title>/, " <title>" + (headers.pageTitle || 'PondLive') + "</title>\n                        <script>window.token = \"" + token + "\";</script>\n                        <script>window.flashMessage = \"" + headers.flashMessage + "\";</script>")
                    .replace('<body>', "<body>\n                                    " + renderedHtml.toString() + "\n                                    <script src=\"/pondLive.js\" defer=\"\"></script>\n                               "));
            });
        });
    };
    ComponentManager.prototype._onEvent = function (clientId, router, res, responseEvent, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var document;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        document = this._sockets.find(function (c) { return c.socket.clientId === clientId; });
                        if (!document) {
                            console.log('No document found', this._path);
                            document = this._sockets.createDocument(function () {
                                return {
                                    socket: new liveSocket_1.LiveSocket(clientId, _this._pond, _this),
                                    rendered: (0, parser_1.html)(templateObject_3 || (templateObject_3 = __makeTemplateObject([""], [""]))),
                                    classes: {}
                                };
                            });
                        }
                        return [4 /*yield*/, callback(document.doc.socket)];
                    case 1:
                        _a.sent();
                        this._pushToClient(router, document, responseEvent, res);
                        return [2 /*return*/];
                }
            });
        });
    };
    ComponentManager.prototype._pushToClient = function (router, document, responseEvent, res) {
        var _this = this;
        if (router.sentResponse)
            return;
        var renderRoutes = function () { return (0, clientRouter_1.clientRouter)(_this._componentId, 'BREAK', (0, parser_1.html)(templateObject_4 || (templateObject_4 = __makeTemplateObject([""], [""])))); };
        var previousRender = document.doc.rendered;
        var renderContext = this._renderComponent(document, renderRoutes);
        var htmlData = (0, clientRouter_1.clientRouter)(this._parentId, this._componentId, renderContext);
        var previous = (0, clientRouter_1.clientRouter)(this._parentId, this._componentId, previousRender);
        var difference = previous.differentiate(htmlData);
        var toSend = responseEvent === 'updated' ? difference : htmlData.getParts();
        res.send(responseEvent, { rendered: toSend, path: this._componentId, headers: router.headers });
    };
    ComponentManager.prototype._renderComponent = function (document, renderRoutes) {
        var renderContext = {
            context: document.doc.socket.context,
            renderRoutes: renderRoutes
        };
        var css = (0, cssGenerator_1.CssGenerator)(this._parentId);
        var styleObject = this._component.manageStyles ? this._component.manageStyles(document.doc.socket.context, css) : {
            string: (0, parser_1.html)(templateObject_5 || (templateObject_5 = __makeTemplateObject([""], [""]))),
            classes: {}
        };
        var rendered = this._component.render(renderContext, styleObject.classes);
        var finalHtml = (0, parser_1.html)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["", "", ""], ["", "", ""])), styleObject.string, rendered);
        document.updateDoc({
            socket: document.doc.socket,
            rendered: finalHtml,
        });
        return finalHtml;
    };
    ComponentManager.prototype._initialiseHTTPManager = function () {
        var _this = this;
        this._chain.use(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var csrfToken, method, eventRequest, resolver, htmlData, router, headers, html_1, headers, html_2, htmlString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        csrfToken = req.headers['x-csrf-token'];
                        method = req.method || '';
                        if (!(method === 'GET' && req.clientId && req.token && req.url)) return [3 /*break*/, 8];
                        eventRequest = this._base.getLiveRequest(this._path, req.url);
                        resolver = this._base.generateEventRequest(this._path, req.url);
                        htmlData = null;
                        router = new liveRouter_1.LiveRouter(res);
                        if (!(resolver && csrfToken === req.token)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.render(req.url, req.clientId, router)];
                    case 1:
                        htmlData = _a.sent();
                        if (router.sentResponse)
                            return [2 /*return*/];
                        return [3 /*break*/, 5];
                    case 2:
                        if (!(eventRequest && !csrfToken)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.render(req.url, req.clientId, router)];
                    case 3:
                        htmlData = _a.sent();
                        if (router.sentResponse)
                            return [2 /*return*/];
                        return [3 /*break*/, 5];
                    case 4:
                        if (csrfToken !== req.token && resolver) {
                            res.statusCode = 403;
                            res.statusMessage = 'Invalid CSRF Token';
                            res.setHeader('Content-Type', 'application/json');
                            return [2 /*return*/, res.end(JSON.stringify({
                                    error: 'Invalid CSRF token'
                                }))];
                        }
                        _a.label = 5;
                    case 5:
                        if (!htmlData) return [3 /*break*/, 8];
                        if (!csrfToken) return [3 /*break*/, 6];
                        headers = router.headers;
                        if (headers.pageTitle)
                            res.setHeader('x-page-title', headers.pageTitle);
                        if (headers.flashMessage)
                            res.setHeader('x-flash-message', headers.flashMessage);
                        res.setHeader('Content-Type', 'text/html');
                        res.setHeader('x-router-container', '#' + this._parentId);
                        html_1 = (0, clientRouter_1.clientRouter)(this._parentId, htmlData.path, htmlData.rendered);
                        return [2 /*return*/, res.end(html_1.toString())];
                    case 6:
                        headers = router.headers;
                        res.setHeader('Content-Type', 'text/html');
                        html_2 = (0, clientRouter_1.clientRouter)(this._parentId, htmlData.path, htmlData.rendered);
                        return [4 /*yield*/, this._renderHtml(html_2, req.token, headers)];
                    case 7:
                        htmlString = _a.sent();
                        return [2 /*return*/, res.end(htmlString)];
                    case 8:
                        next();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    ComponentManager.prototype._initialiseSocketManager = function () {
        var _this = this;
        this._pond.on("mount/" + this._componentId, function (req, res, channel) { return __awaiter(_this, void 0, void 0, function () {
            var router;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        router = new liveRouter_1.LiveRouter(res);
                        return [4 /*yield*/, this.handleRendered(req.client.clientAssigns.clientId, router, res, channel)];
                    case 1:
                        _a.sent();
                        channel.subscribe(function (data) {
                            if (data.action === enums_1.ServerActions.PRESENCE && data.event === 'LEAVE_CHANNEL')
                                _this.handleUnmount(req.client.clientAssigns.clientId);
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        this._pond.on("update/" + this._componentId, function (req, res, channel) { return __awaiter(_this, void 0, void 0, function () {
            var router;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        router = new liveRouter_1.LiveRouter(res);
                        return [4 /*yield*/, this.handleRendered(req.client.clientAssigns.clientId, router, res, channel)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        this._pond.on("event/" + this._componentId, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var router;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        router = new liveRouter_1.LiveRouter(res);
                        return [4 /*yield*/, this.handleEvent(req.message, req.client.clientAssigns.clientId, router, res)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        this._pond.on("unmount/" + this._componentId, function (req) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('unmount', this._path);
                        return [4 /*yield*/, this.handleUnmount(req.client.clientAssigns.clientId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    ComponentManager.prototype._initialiseManager = function () {
        this._initialiseHTTPManager();
        this._initialiseSocketManager();
    };
    return ComponentManager;
}());
exports.ComponentManager = ComponentManager;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
