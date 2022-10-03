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
exports.PondLiveChannelManager = exports.PondLiveChannel = void 0;
var utils_1 = require("../../utils");
var PondLiveChannel = /** @class */ (function () {
    function PondLiveChannel(topic, destroy) {
        this.topic = topic;
        this._subscriberCount = 0;
        this._data = {};
        this._subject = new utils_1.EventPubSub();
        this._destroy = destroy;
    }
    PondLiveChannel.prototype.assign = function (data) {
        this._data = Object.assign(this._data, data);
    };
    Object.defineProperty(PondLiveChannel.prototype, "data", {
        get: function () {
            var result = __assign({}, this._data);
            return Object.freeze(result);
        },
        enumerable: false,
        configurable: true
    });
    PondLiveChannel.prototype.onComplete = function (callback) {
        var _this = this;
        this._subject.onComplete(function () {
            callback(_this._data);
        });
    };
    PondLiveChannel.prototype._buildUnsubscribe = function (subscription) {
        var _this = this;
        return {
            unsubscribe: function () {
                subscription.unsubscribe();
                _this._subscriberCount--;
                if (_this._subscriberCount === 0)
                    _this.destroy();
            }
        };
    };
    PondLiveChannel.prototype.subscribe = function (event, callback) {
        this._subscriberCount++;
        var unsubscribe = this._subject.subscribe(event, callback);
        return this._buildUnsubscribe(unsubscribe);
    };
    PondLiveChannel.prototype.subscribeAll = function (callback) {
        this._subscriberCount++;
        var unsubscribe = this._subject.subscribeAll(callback);
        return this._buildUnsubscribe(unsubscribe);
    };
    PondLiveChannel.prototype.broadcast = function (event, data) {
        this._subject.publish(event, data);
    };
    PondLiveChannel.prototype.destroy = function () {
        this._subject.complete();
        this._destroy();
    };
    return PondLiveChannel;
}());
exports.PondLiveChannel = PondLiveChannel;
var PondLiveChannelManager = /** @class */ (function () {
    function PondLiveChannelManager() {
        this._channels = new utils_1.PondBase();
    }
    PondLiveChannelManager.prototype.getChannel = function (topic) {
        var _a;
        return ((_a = this._channels.find(function (channel) { return channel.topic === topic; })) === null || _a === void 0 ? void 0 : _a.doc) || null;
    };
    PondLiveChannelManager.prototype.createChannel = function (topic) {
        return this._channels.createDocument(function (doc) {
            return new PondLiveChannel(topic, doc.removeDoc.bind(doc));
        }).doc;
    };
    Object.defineProperty(PondLiveChannelManager.prototype, "channels", {
        get: function () {
            return this._channels.toArray();
        },
        enumerable: false,
        configurable: true
    });
    PondLiveChannelManager.prototype.broadcast = function (topic, event, data) {
        var channel = this.getChannel(topic);
        if (channel)
            channel.broadcast(event, data);
    };
    PondLiveChannelManager.prototype.subscribe = function (topic, event, callback) {
        var channel = this.getChannel(topic) || this.createChannel(topic);
        return channel.subscribe(event, callback);
    };
    PondLiveChannelManager.prototype.subscribeAll = function (topic, callback) {
        var channel = this.getChannel(topic) || this.createChannel(topic);
        return channel.subscribeAll(callback);
    };
    return PondLiveChannelManager;
}());
exports.PondLiveChannelManager = PondLiveChannelManager;
