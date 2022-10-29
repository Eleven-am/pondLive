"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastChannel = void 0;
const base_1 = require("@eleven-am/pondsocket/base");
class BroadcastChannel {
    constructor(initialData) {
        this._channelData = initialData;
        this._database = new base_1.SimpleBase();
        this._contextId = Math.random().toString(36).substring(7);
    }
    get channelData() {
        const temp = Object.assign({}, this._channelData);
        return Object.freeze(temp);
    }
    assign(assigns) {
        this._channelData = Object.assign(this._channelData, assigns);
    }
    subscribe(socket) {
        socket.subscribeToBroadcastChannel(this, this._contextId);
    }
    mountSocket(socket) {
        const doc = this._database.getOrCreate(socket.clientId, () => socket);
        return {
            unsubscribe: () => {
                doc.removeDoc();
            }
        };
    }
    broadcast(payload) {
        this._database.all
            .forEach(doc => doc.doc.onMessage({ event: this._contextId, payload }));
    }
    broadcastFrom(socket, payload) {
        const client = this._database.get(socket.clientId);
        if (!client)
            throw new Error("Socket is not subscribed to this channel");
        this._database.filter(doc => doc.clientId !== socket.clientId)
            .forEach(doc => doc.doc.onMessage({ event: this._contextId, payload }));
    }
    handleInfo(data, callback) {
        if (data.event === this._contextId)
            callback(data.payload);
    }
}
exports.BroadcastChannel = BroadcastChannel;
