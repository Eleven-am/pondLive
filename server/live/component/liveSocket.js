"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveSocket = void 0;
var liveRouter_1 = require("./liveRouter");
var LiveSocket = /** @class */ (function () {
    function LiveSocket(clientId, pond, manager) {
        this._liveContext = {};
        this.clientId = clientId;
        this._pond = pond;
        this._subscriptions = [];
        this._manager = manager;
        this._channel = null;
    }
    Object.defineProperty(LiveSocket.prototype, "channel", {
        set: function (channel) {
            this._channel = channel;
        },
        enumerable: false,
        configurable: true
    });
    LiveSocket.prototype.getChannel = function (name) {
        return this._pond.findChannel(function (c) { return c.name === name; });
    };
    Object.defineProperty(LiveSocket.prototype, "context", {
        get: function () {
            return this._liveContext;
        },
        enumerable: false,
        configurable: true
    });
    LiveSocket.prototype.assign = function (assigns) {
        this._liveContext = Object.assign(this._liveContext, assigns);
    };
    LiveSocket.prototype.assignToChannel = function (name, assigns) {
        var channel = this._pond.findChannel(function (c) { return c.name === name; });
        if (channel)
            channel.data = assigns;
    };
    LiveSocket.prototype.broadcast = function (channel, event, data) {
        this._pond.broadcastToChannel(channel, this.clientId, { event: event, data: data });
    };
    LiveSocket.prototype.getChannelData = function (name) {
        var channel = this._pond.findChannel(function (c) { return c.name === name; });
        if (channel)
            return channel.data;
        return null;
    };
    LiveSocket.prototype.subscribe = function (name) {
        var _this = this;
        var sub = this._pond.subscribe(name, function (data) {
            if (_this._channel && data.event !== _this.clientId) {
                var clientId = Object.keys(_this._channel.info.assigns)[0];
                if (clientId) {
                    var response = _this._channel.createPondResponse(clientId);
                    var router = new liveRouter_1.LiveRouter(response);
                    var info = data.payload;
                    _this._manager.handleInfo(info, _this, router, response);
                }
            }
        });
        this._subscriptions.push({ name: name, sub: sub });
    };
    LiveSocket.prototype.unsubscribe = function (name) {
        var find = this._subscriptions.findIndex(function (s) { return s.name === name; });
        if (find !== -1) {
            this._subscriptions[find].sub.unsubscribe();
            this._subscriptions.splice(find, 1);
        }
    };
    return LiveSocket;
}());
exports.LiveSocket = LiveSocket;
