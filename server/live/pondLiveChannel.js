"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondLiveChannelManager = exports.PondLiveChannel = void 0;
const utils_1 = require("../utils");
class PondLiveChannel {
    topic;
    _subscriberCount;
    _data;
    _subject;
    _destroy;
    constructor(topic, destroy) {
        this.topic = topic;
        this._subscriberCount = 0;
        this._data = {};
        this._subject = new utils_1.EventPubSub();
        this._destroy = destroy;
    }
    assign(data) {
        this._data = Object.assign(this._data, data);
    }
    get data() {
        return this._data;
    }
    _buildUnsubscribe(subscription) {
        return {
            unsubscribe: () => {
                subscription.unsubscribe();
                this._subscriberCount--;
                if (this._subscriberCount === 0)
                    this._destroy();
            }
        };
    }
    subscribe(event, callback) {
        this._subscriberCount++;
        const unsubscribe = this._subject.subscribe(event, callback);
        return this._buildUnsubscribe(unsubscribe);
    }
    subscribeAll(callback) {
        this._subscriberCount++;
        const unsubscribe = this._subject.subscribeAll(callback);
        return this._buildUnsubscribe(unsubscribe);
    }
    broadcast(event, data) {
        this._subject.publish(event, data);
    }
    destroy() {
        this._subject.complete();
        this._destroy();
    }
}
exports.PondLiveChannel = PondLiveChannel;
class PondLiveChannelManager {
    _channels;
    constructor() {
        this._channels = new utils_1.PondBase();
    }
    getChannel(topic) {
        return this._channels.find(channel => channel.topic === topic)?.doc || null;
    }
    createChannel(topic) {
        return this._channels.createDocument(doc => {
            return new PondLiveChannel(topic, doc.removeDoc.bind(doc));
        }).doc;
    }
    get channels() {
        return this._channels.toArray();
    }
    broadcast(topic, event, data) {
        const channel = this.getChannel(topic);
        if (channel)
            channel.broadcast(event, data);
    }
    subscribe(topic, event, callback) {
        const channel = this.getChannel(topic) || this.createChannel(topic);
        return channel.subscribe(event, callback);
    }
    subscribeAll(topic, callback) {
        const channel = this.getChannel(topic) || this.createChannel(topic);
        return channel.subscribeAll(callback);
    }
}
exports.PondLiveChannelManager = PondLiveChannelManager;
