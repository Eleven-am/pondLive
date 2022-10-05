"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.LiveSocket = void 0;
var utils_1 = require("../../utils");
var liveRouter_1 = require("./liveRouter");
var LiveSocket = /** @class */ (function () {
    function LiveSocket(clientId, pond, manager, remove) {
        this._liveContext = {};
        this.clientId = clientId;
        this._pond = pond;
        this._subscriptions = [];
        this._manager = manager;
        this._channel = null;
        this._isWebsocket = false;
        this._remove = remove;
    }
    /**
     * @desc This method is called when a websocket connection is established ont his context.
     * @param channel - The channel that was created.
     */
    LiveSocket.prototype.upgradeToWebsocket = function (channel) {
        this._isWebsocket = true;
        this._channel = channel;
    };
    /**
     * @desc This method is called when the websocket connection is closed.
     */
    LiveSocket.prototype.downgrade = function () {
        this._isWebsocket = false;
        this._channel = null;
        this._subscriptions.forEach(function (s) { return s.sub.unsubscribe(); });
        this._subscriptions.length = 0;
    };
    Object.defineProperty(LiveSocket.prototype, "isWebsocket", {
        /**
         * @desc Checks it the current context is a websocket connection.
         */
        get: function () {
            return this._isWebsocket;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @desc Gets a specific pub/sub channel from the pond.
     * @param name - The name of the channel.
     */
    LiveSocket.prototype.getChannel = function (name) {
        return this._pond.getChannel(name);
    };
    Object.defineProperty(LiveSocket.prototype, "context", {
        /**
         * @desc Gets the live context.
         */
        get: function () {
            var result = __assign({}, this._liveContext);
            return Object.freeze(result);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @desc Assigns data to the current context.
     * @param assigns - The data to assign.
     */
    LiveSocket.prototype.assign = function (assigns) {
        this._liveContext = Object.assign(this._liveContext, assigns);
    };
    /**
     * @desc Assigns data to a pub/sub channel.
     * @param name - The name of the channel.
     * @param assigns - The data to assign.
     */
    LiveSocket.prototype.assignToChannel = function (name, assigns) {
        var channel = this.getChannel(name);
        if (channel)
            channel.assign(assigns);
    };
    /**
     * @desc Broadcasts data to a pub/sub channel.
     * @param channel - The name of the channel.
     * @param event - The event name.
     * @param data - The data to broadcast.
     */
    LiveSocket.prototype.broadcast = function (channel, event, data) {
        var payload = __assign(__assign({}, data), { sender: this.clientId });
        this._pond.broadcast(channel, event, payload);
    };
    /**
     * @desc Gets data assigned to a pub/sub channel.
     * @param name - The name of the channel.
     */
    LiveSocket.prototype.getChannelData = function (name) {
        var channel = this.getChannel(name);
        if (channel)
            return channel.data;
        return null;
    };
    /**
     * @desc Subscribes to a pub/sub channel.
     * @param name - The name of the channel.
     * @param event - The event name.
     */
    LiveSocket.prototype.subscribe = function (name, event) {
        var _this = this;
        var sub = this._pond.subscribe(name, event, function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response, router, info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(data.sender !== this.clientId)) return [3 /*break*/, 2];
                        response = this._createPondResponse();
                        router = new liveRouter_1.LiveRouter(response);
                        info = (data === null || data === void 0 ? void 0 : data.payload) || data;
                        return [4 /*yield*/, this._manager.handleInfo(info, this, router, response)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); });
        this._subscriptions.push({ name: name, sub: sub });
    };
    /**
     * @desc Unsubscribes from a pub/sub channel.
     * @param name - The name of the channel.
     */
    LiveSocket.prototype.unsubscribe = function (name) {
        var subs = this._subscriptions.filter(function (s) { return s.name === name; });
        this._subscriptions = this._subscriptions.filter(function (s) { return s.name !== name; });
        subs.forEach(function (s) { return s.sub.unsubscribe(); });
    };
    /**
     * @desc Subscribes to all events on a pub/sub channel.
     * @param name - The name of the channel.
     */
    LiveSocket.prototype.subscribeAll = function (name) {
        var _this = this;
        var sub = this._pond.subscribeAll(name, function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response, router, info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(data.sender !== this.clientId)) return [3 /*break*/, 2];
                        response = this._createPondResponse();
                        router = new liveRouter_1.LiveRouter(response);
                        info = (data === null || data === void 0 ? void 0 : data.payload) || data;
                        return [4 /*yield*/, this._manager.handleInfo(info, this, router, response)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); });
        this._subscriptions.push({ name: name, sub: sub });
    };
    /**
     * @desc Emits an event on the browser window.
     * @param event - The event name.
     * @param data - The data to emit.
     */
    LiveSocket.prototype.emit = function (event, data) {
        if (this._channel)
            this._channel.broadcast(event, data);
    };
    LiveSocket.prototype.destroy = function () {
        this._subscriptions.forEach(function (s) { return s.sub.unsubscribe(); });
        this._subscriptions.length = 0;
        this._remove();
    };
    LiveSocket.prototype._createPondResponse = function () {
        var _this = this;
        if (!this._channel)
            throw new utils_1.PondError("Cannot create a pond response without a websocket.", 500, "PondError");
        var assigns = {
            assigns: {},
            presence: {},
            channelData: {}
        };
        var resolver = function (data) {
            if (data.error)
                throw new utils_1.PondError(data.error.errorMessage, data.error.errorCode, 'PondError');
            else if (data.message && _this._channel)
                _this._channel.broadcast(data.message.event, data.message.payload);
            return;
        };
        return new utils_1.PondResponse(this._channel, assigns, resolver);
    };
    return LiveSocket;
}());
exports.LiveSocket = LiveSocket;
