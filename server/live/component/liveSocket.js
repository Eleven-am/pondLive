"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveSocket = void 0;
const liveRouter_1 = require("./liveRouter");
class LiveSocket {
    _liveContext;
    clientId;
    _pond;
    _channel;
    _manager;
    _subscriptions;
    constructor(clientId, pond, manager) {
        this._liveContext = {};
        this.clientId = clientId;
        this._pond = pond;
        this._subscriptions = [];
        this._manager = manager;
        this._channel = null;
    }
    set channel(channel) {
        this._channel = channel;
    }
    getChannel(name) {
        return this._pond.findChannel(c => c.name === name);
    }
    get context() {
        return this._liveContext;
    }
    assign(assigns) {
        this._liveContext = Object.assign(this._liveContext, assigns);
    }
    assignToChannel(name, assigns) {
        const channel = this._pond.findChannel(c => c.name === name);
        if (channel)
            channel.data = assigns;
    }
    broadcast(channel, event, data) {
        this._pond.broadcastToChannel(channel, this.clientId, { event, data });
    }
    getChannelData(name) {
        const channel = this._pond.findChannel(c => c.name === name);
        if (channel)
            return channel.data;
        return null;
    }
    subscribe(name) {
        const sub = this._pond.subscribe(name, data => {
            if (this._channel && data.event !== this.clientId) {
                const clientId = Object.keys(this._channel.info.assigns)[0];
                if (clientId) {
                    const response = this._channel.createPondResponse(clientId);
                    const router = new liveRouter_1.LiveRouter(response);
                    const info = data.payload;
                    this._manager.handleInfo(info, this, router, response);
                }
            }
        });
        this._subscriptions.push({ name: name, sub: sub });
    }
    unsubscribe(name) {
        const find = this._subscriptions.findIndex(s => s.name === name);
        if (find !== -1) {
            this._subscriptions[find].sub.unsubscribe();
            this._subscriptions.splice(find, 1);
        }
    }
}
exports.LiveSocket = LiveSocket;
