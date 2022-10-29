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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentManager = void 0;
var fs = __importStar(require("fs"));
var path_1 = __importDefault(require("path"));
var parser_1 = require("./parser");
var emitters_1 = require("../emitters");
var server_1 = require("../server");
var base_1 = require("@eleven-am/pondsocket/base");
var pondsocket_1 = require("@eleven-am/pondsocket");
var baseClass_1 = require("../utils/baseClass");
var ComponentManager = /** @class */ (function () {
    function ComponentManager(path, component, props) {
        var _this = this;
        this._base = new baseClass_1.BaseClass();
        this._path = path.replace(/\/{2,}/g, '/');
        this._parentId = props.parentId;
        this._componentId = this._base.nanoId();
        this._component = component;
        this._pond = props.pond;
        this._chain = props.chain;
        this._sockets = new base_1.SimpleBase();
        this._internalBus = props.internalBus;
        this._initialiseManager();
        this._setupEventHandler();
        this._htmlPath = props.htmlPath;
        this._secret = props.secret;
        this._uploadPath = props.uploadPath;
        this._providers = [];
        var contexts = __spreadArray(__spreadArray([], __read(component.providers), false), __read(props.providers), false);
        contexts.forEach(function (context) { return __awaiter(_this, void 0, void 0, function () {
            var shouldAdd;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, context.subscribe(this._componentId, this._component)];
                    case 1:
                        shouldAdd = _a.sent();
                        if (!shouldAdd)
                            return [2 /*return*/];
                        this._providers.push(context);
                        return [2 /*return*/];
                }
            });
        }); });
        this._innerManagers = (component.routes || []).map(function (route) { return new ComponentManager("".concat(path).concat(route.path), new route.Component(), {
            parentId: _this._componentId,
            pond: _this._pond,
            chain: _this._chain,
            htmlPath: props.htmlPath,
            internalBus: props.internalBus,
            providers: contexts,
            secret: props.secret,
            uploadPath: props.uploadPath,
        }); });
    }
    ComponentManager.prototype.manageSocketRender = function (socket, router, response, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var document;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        document = this._sockets.get(socket.clientId);
                        if (!document) {
                            this._internalBus.publish({ clientId: socket.clientId, action: 'DISCONNECT' });
                            socket.destroy(true);
                            router.reload();
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, callback(this._component)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._pushToClient(router, document, 'updated', response)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ComponentManager.prototype._handleUpload = function (uploadMessage, clientId, event) {
        return __awaiter(this, void 0, void 0, function () {
            var document, uploadEvent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        document = this._sockets.get(clientId);
                        if (!document) {
                            uploadMessage.files.forEach(function (file) { return file.destroy(); });
                            this._internalBus.publish({ clientId: clientId, action: 'DISCONNECT' });
                            return [2 /*return*/];
                        }
                        uploadEvent = {
                            type: event,
                            files: uploadMessage.files,
                        };
                        return [4 /*yield*/, document.doc.socket.onUpload(uploadEvent)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ComponentManager.prototype._handleUploadAuthorise = function (authorizer, clientId, event, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var router, document, socket, eventRequest;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this._component.onUploadRequest || !this._component.onUpload) {
                            authorizer.sendError('Upload not supported');
                            return [2 /*return*/];
                        }
                        router = new emitters_1.LiveRouter(res);
                        document = this._sockets.get(clientId);
                        if (!document) {
                            authorizer.sendError('Client not found');
                            return [2 /*return*/];
                        }
                        socket = document.doc.socket;
                        eventRequest = {
                            type: event, message: authorizer,
                        };
                        (_a = this._component.onUploadRequest) === null || _a === void 0 ? void 0 : _a.call(socket.context, eventRequest, socket, router);
                        return [4 /*yield*/, this._pushToClient(router, document, 'updated', res)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ComponentManager.prototype._render = function (data, clientId, router) {
        return __awaiter(this, void 0, void 0, function () {
            var document, socket, mountContext, innerHtml, _a, _b, manager, event_1, rendered_1, e_1_1, renderRoutes, rendered;
            var e_1, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (router.sentResponse)
                            return [2 /*return*/, null];
                        document = this._sockets.getOrCreate(clientId, function (doc) {
                            return {
                                socket: new emitters_1.LiveSocket(clientId, _this, doc.removeDoc.bind(doc)), rendered: (0, parser_1.html)(templateObject_1 || (templateObject_1 = __makeTemplateObject([""], [""]))), timer: null,
                            };
                        });
                        socket = document.doc.socket;
                        mountContext = {
                            params: data.params,
                            path: data.address,
                            query: data.query
                        };
                        if (!this._component.mount) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._component.mount(mountContext, socket, router)];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        if (router.sentResponse)
                            return [2 /*return*/, null];
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
                        return [4 /*yield*/, manager._render(event_1, clientId, router)];
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
                        this._providers.forEach(function (provider) { return socket.subscribeToContextManager(provider); });
                        if (router.sentResponse)
                            return [2 /*return*/, null];
                        renderRoutes = function () { return _this._createRouter((innerHtml === null || innerHtml === void 0 ? void 0 : innerHtml.rendered) || (0, parser_1.html)(templateObject_2 || (templateObject_2 = __makeTemplateObject([""], [""]))), _this._componentId, (innerHtml === null || innerHtml === void 0 ? void 0 : innerHtml.path) || ''); };
                        return [4 /*yield*/, this._renderComponent(document, renderRoutes)];
                    case 11:
                        rendered = _d.sent();
                        return [2 /*return*/, {
                                path: this._componentId, rendered: rendered
                            }];
                }
            });
        });
    };
    ComponentManager.prototype._handleEvent = function (event, clientId, router) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._onEvent(clientId, function (socket) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, ((_a = this._component.onEvent) === null || _a === void 0 ? void 0 : _a.call(socket.context, event, socket, router))];
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
    ComponentManager.prototype._handleRendered = function (clientId, router, res, channel) {
        return __awaiter(this, void 0, void 0, function () {
            var event;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event = {
                            router: router, response: res
                        };
                        return [4 /*yield*/, this._onEvent(clientId, function (socket) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            socket.upgradeToWebsocket(channel);
                                            return [4 /*yield*/, ((_a = this._component.onRendered) === null || _a === void 0 ? void 0 : _a.call(socket.context, socket, router))];
                                        case 1:
                                            _b.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, event)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ComponentManager.prototype._handleUnmount = function (clientId) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var socket;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        socket = this._sockets.get(clientId);
                        if (!socket)
                            return [2 /*return*/];
                        return [4 /*yield*/, ((_a = this._component.onUnmount) === null || _a === void 0 ? void 0 : _a.call(socket.doc.socket.context, socket.doc.socket))];
                    case 1:
                        _b.sent();
                        socket.doc.socket.destroy();
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
    ComponentManager.prototype._onEvent = function (clientId, callback, props) {
        if (props === void 0) { props = null; }
        return __awaiter(this, void 0, void 0, function () {
            var document, router, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        document = this._sockets.get(clientId);
                        if (!document) {
                            this._internalBus.publish({ clientId: clientId, action: 'DISCONNECT' });
                            props === null || props === void 0 ? void 0 : props.router.reload();
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, callback(document.doc.socket)];
                    case 1:
                        _a.sent();
                        if (!props)
                            return [2 /*return*/];
                        router = props.router, response = props.response;
                        if (router.sentResponse)
                            return [2 /*return*/];
                        return [4 /*yield*/, this._pushToClient(router, document, 'rendered', response)];
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
                        renderRoutes = function () { return _this._createRouter((0, parser_1.html)(templateObject_3 || (templateObject_3 = __makeTemplateObject([""], [""]))), _this._componentId, 'BREAK'); };
                        previousRender = document.doc.rendered;
                        return [4 /*yield*/, this._renderComponent(document, renderRoutes)];
                    case 1:
                        renderContext = _a.sent();
                        htmlData = this._createRouter(renderContext, this._parentId, this._componentId);
                        if (responseEvent === 'updated') {
                            previous = this._createRouter(previousRender);
                            difference = previous.differentiate(htmlData);
                            if (this._base.isObjectEmpty(difference))
                                return [2 /*return*/];
                            res.send(responseEvent, { rendered: difference, path: this._componentId, headers: router.headers });
                        }
                        else {
                            res.send(responseEvent, {
                                rendered: htmlData.getParts(), path: this._componentId, headers: router.headers
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
                css = (0, parser_1.CssGenerator)(this._parentId);
                styleObject = this._component.manageStyles ? this._component.manageStyles.call(document.doc.socket.context, css) : {
                    string: (0, parser_1.html)(templateObject_4 || (templateObject_4 = __makeTemplateObject([""], [""]))), classes: {}
                };
                rendered = this._component.render.call(document.doc.socket.context, renderContext, styleObject.classes);
                finalHtml = (0, parser_1.html)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["", "", ""], ["", "", ""])), styleObject.string, rendered);
                document.updateDoc({
                    socket: document.doc.socket, rendered: finalHtml
                });
                return [2 /*return*/, finalHtml];
            });
        });
    };
    ComponentManager.prototype._initialiseHTTPManager = function () {
        var _this = this;
        this._chain.use(function (request, response, next) { return __awaiter(_this, void 0, void 0, function () {
            var extension, csrfToken, method, _a, clientId, token, eventRequest, resolver;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        extension = path_1.default.extname(request.url);
                        if (extension !== '')
                            return [2 /*return*/, next()];
                        csrfToken = request.get('x-csrf-token');
                        method = request.method;
                        _a = request.auth, clientId = _a.clientId, token = _a.token;
                        if (!(method === 'GET' && clientId && token)) return [3 /*break*/, 4];
                        eventRequest = this._base.getLiveRequest(this._path, request.url);
                        resolver = this._base.generateEventRequest(this._path, request.url);
                        if (!(resolver && csrfToken)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._handleCSRFRequest(resolver, csrfToken, clientId, response, next)];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        if (!(eventRequest && !csrfToken)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._handleInitialRequest(eventRequest, clientId, response, next)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        next();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    ComponentManager.prototype._initialiseSocketManager = function () {
        var _this = this;
        this._pond.on("mount/".concat(this._componentId), function (req, res, channel) { return __awaiter(_this, void 0, void 0, function () {
            var router, sub;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        router = new emitters_1.LiveRouter(res);
                        return [4 /*yield*/, this._handleRendered(req.client.clientAssigns.clientId, router, res, channel)];
                    case 1:
                        _a.sent();
                        sub = channel.onPresenceChange(function (data) {
                            if (data.action === pondsocket_1.ServerActions.PRESENCE && data.event === 'LEAVE_CHANNEL') {
                                _this._handleUnmount(req.client.clientAssigns.clientId);
                                sub.unsubscribe();
                            }
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        this._pond.on("update/".concat(this._componentId), function (req, res, channel) { return __awaiter(_this, void 0, void 0, function () {
            var router, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        router = new emitters_1.LiveRouter(res);
                        return [4 /*yield*/, this._handleRendered(req.client.clientAssigns.clientId, router, res, channel)];
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
        this._pond.on("event/".concat(this._componentId), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var router, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        router = new emitters_1.LiveRouter(res);
                        return [4 /*yield*/, this._handleEvent(req.message, req.client.clientAssigns.clientId, router)];
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
        this._pond.on("unmount/".concat(this._componentId), function (req) { return __awaiter(_this, void 0, void 0, function () {
            var e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._handleUnmount(req.client.clientAssigns.clientId)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_4 = _a.sent();
                        throw e_4;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        this._pond.on("".concat(this._componentId, "/upload/token"), function (req, res, channel) {
            var _a;
            if (req.message.files && req.message.files.length > 0 && ((_a = req.message.metadata) === null || _a === void 0 ? void 0 : _a.identifier) && req.message.type) {
                var files = req.message.files;
                var identifier = req.message.metadata.identifier;
                var authorizer = new server_1.UploadAuthoriseMessage(files, identifier, req.client.clientAssigns.clientId, _this._uploadPath, channel);
                void _this._handleUploadAuthorise(authorizer, req.client.clientAssigns.clientId, req.message.type, res);
            }
        });
    };
    ComponentManager.prototype._initialiseManager = function () {
        this._initialiseHTTPManager();
        this._initialiseSocketManager();
    };
    ComponentManager.prototype._setupEventHandler = function () {
        var _this = this;
        if (this._component.onUpload)
            this._internalBus.subscribe(function (data) {
                if ("message" in data && (data === null || data === void 0 ? void 0 : data.message)) {
                    if (data.componentId === _this._componentId)
                        void _this._handleUpload(data.message, data.clientId, data.event);
                }
                else if ("event" in data && (data === null || data === void 0 ? void 0 : data.event)) {
                    var document_1 = _this._sockets.get(data.clientId);
                    if (document_1)
                        document_1.doc.socket.destroy(true);
                }
            });
    };
    ComponentManager.prototype._createRouter = function (innerRoute, parentId, componentId) {
        if (parentId === void 0) { parentId = this._parentId; }
        if (componentId === void 0) { componentId = this._componentId; }
        return (0, parser_1.html)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n            <div id=\"", "\" pond-router=\"", "\">", "</div>"], ["\n            <div id=\"", "\" pond-router=\"", "\">", "</div>"])), parentId, componentId, innerRoute);
    };
    ComponentManager.prototype._handleInitialRequest = function (request, clientId, response, next) {
        return __awaiter(this, void 0, void 0, function () {
            var router, htmlData, headers, html_1, htmlString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        router = new emitters_1.LiveRouter(response);
                        return [4 /*yield*/, this._render(request, clientId, router)];
                    case 1:
                        htmlData = _a.sent();
                        if (router.sentResponse)
                            return [2 /*return*/];
                        if (!htmlData) return [3 /*break*/, 3];
                        headers = router.headers;
                        html_1 = this._createRouter(htmlData.rendered);
                        return [4 /*yield*/, this._renderHtml(html_1, headers)];
                    case 2:
                        htmlString = _a.sent();
                        response.html(htmlString);
                        _a.label = 3;
                    case 3:
                        next();
                        return [2 /*return*/];
                }
            });
        });
    };
    ComponentManager.prototype._handleCSRFRequest = function (request, csrfToken, clientId, response, next) {
        return __awaiter(this, void 0, void 0, function () {
            var router, data, htmlData, headers, html_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        router = new emitters_1.LiveRouter(response);
                        data = this._base.decrypt(this._secret, csrfToken);
                        if (!data || data.clientId !== clientId) {
                            response.status(403)
                                .json({
                                error: 'Invalid CSRF token'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this._render(request, clientId, router)];
                    case 1:
                        htmlData = _a.sent();
                        if (router.sentResponse)
                            return [2 /*return*/];
                        if (htmlData) {
                            headers = router.headers;
                            if (headers.pageTitle)
                                response.setHeader('x-page-title', headers.pageTitle);
                            if (headers.flashMessage)
                                response.setHeader('x-flash-message', headers.flashMessage);
                            response.setHeader('x-router-container', '#' + this._parentId);
                            html_2 = this._createRouter(htmlData.rendered);
                            response.html(html_2.toString());
                        }
                        next();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ComponentManager;
}());
exports.ComponentManager = ComponentManager;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
