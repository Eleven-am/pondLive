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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastChannel = void 0;
var base_1 = require("@eleven-am/pondsocket/base");
var BroadcastChannel = /** @class */ (function () {
    function BroadcastChannel(initialData) {
        this._channelData = initialData;
        this._database = new base_1.SimpleBase();
        this._contextId = Math.random().toString(36).substring(7);
    }
    Object.defineProperty(BroadcastChannel.prototype, "channelData", {
        get: function () {
            var temp = __assign({}, this._channelData);
            return Object.freeze(temp);
        },
        enumerable: false,
        configurable: true
    });
    BroadcastChannel.prototype.assign = function (assigns) {
        this._channelData = Object.assign(this._channelData, assigns);
    };
    BroadcastChannel.prototype.subscribe = function (socket) {
        socket.subscribeToBroadcastChannel(this, this._contextId);
    };
    BroadcastChannel.prototype.mountSocket = function (socket) {
        var doc = this._database.getOrCreate(socket.clientId, function () { return socket; });
        return {
            unsubscribe: function () {
                doc.removeDoc();
            }
        };
    };
    BroadcastChannel.prototype.broadcast = function (payload) {
        var _this = this;
        this._database.all
            .forEach(function (doc) { return doc.doc.onMessage({ event: _this._contextId, payload: payload }); });
    };
    BroadcastChannel.prototype.broadcastFrom = function (socket, payload) {
        var _this = this;
        var client = this._database.get(socket.clientId);
        if (!client)
            throw new Error("Socket is not subscribed to this channel");
        this._database.filter(function (doc) { return doc.clientId !== socket.clientId; })
            .forEach(function (doc) { return doc.doc.onMessage({ event: _this._contextId, payload: payload }); });
    };
    BroadcastChannel.prototype.handleInfo = function (data, callback) {
        if (data.event === this._contextId)
            callback(data.payload);
    };
    return BroadcastChannel;
}());
exports.BroadcastChannel = BroadcastChannel;
