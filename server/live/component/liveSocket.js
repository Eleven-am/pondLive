"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveSocket = void 0;
const utils_1 = require("../../utils");
const liveRouter_1 = require("./liveRouter");
class LiveSocket {
    _liveContext;
    clientId;
    _isWebsocket;
    _pond;
    _channel;
    _manager;
    _remove;
    _subscriptions;
    constructor(clientId, pond, manager, remove) {
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
    upgradeToWebsocket(channel) {
        this._isWebsocket = true;
        this._channel = channel;
    }
    /**
     * @desc This method is called when the websocket connection is closed.
     */
    downgrade() {
        this._isWebsocket = false;
        this._channel = null;
        this._subscriptions.forEach(s => s.sub.unsubscribe());
        this._subscriptions.length = 0;
    }
    /**
     * @desc Checks it the current context is a websocket connection.
     */
    get isWebsocket() {
        return this._isWebsocket;
    }
    /**
     * @desc Gets a specific pub/sub channel from the pond.
     * @param name - The name of the channel.
     */
    getChannel(name) {
        return this._pond.getChannel(name);
    }
    /**
     * @desc Gets the live context.
     */
    get context() {
        return this._liveContext;
    }
    /**
     * @desc Assigns data to the current context.
     * @param assigns - The data to assign.
     */
    assign(assigns) {
        this._liveContext = Object.assign(this._liveContext, assigns);
    }
    /**
     * @desc Assigns data to a pub/sub channel.
     * @param name - The name of the channel.
     * @param assigns - The data to assign.
     */
    assignToChannel(name, assigns) {
        const channel = this.getChannel(name);
        if (channel)
            channel.assign(assigns);
    }
    /**
     * @desc Broadcasts data to a pub/sub channel.
     * @param channel - The name of the channel.
     * @param event - The event name.
     * @param data - The data to broadcast.
     */
    broadcast(channel, event, data) {
        const payload = {
            ...data,
            sender: this.clientId
        };
        this._pond.broadcast(channel, event, payload);
    }
    /**
     * @desc Gets data assigned to a pub/sub channel.
     * @param name - The name of the channel.
     */
    getChannelData(name) {
        const channel = this.getChannel(name);
        if (channel)
            return channel.data;
        return null;
    }
    /**
     * @desc Subscribes to a pub/sub channel.
     * @param name - The name of the channel.
     * @param event - The event name.
     */
    subscribe(name, event) {
        const sub = this._pond.subscribe(name, event, async (data) => {
            if (this._channel && data.sender !== this.clientId) {
                const response = this._createPondResponse();
                const router = new liveRouter_1.LiveRouter(response);
                const info = data.payload;
                await this._manager.handleInfo(info, this, router, response);
            }
        });
        this._subscriptions.push({ name: name, sub: sub });
    }
    /**
     * @desc Unsubscribes from a pub/sub channel.
     * @param name - The name of the channel.
     */
    unsubscribe(name) {
        const subs = this._subscriptions.filter(s => s.name === name);
        this._subscriptions = this._subscriptions.filter(s => s.name !== name);
        subs.forEach(s => s.sub.unsubscribe());
    }
    /**
     * @desc Subscribes to all events on a pub/sub channel.
     * @param name - The name of the channel.
     */
    subscribeAll(name) {
        const sub = this._pond.subscribeAll(name, async (data) => {
            if (this._channel && data.sender !== this.clientId) {
                const response = this._createPondResponse();
                const router = new liveRouter_1.LiveRouter(response);
                const info = data.payload;
                await this._manager.handleInfo(info, this, router, response);
            }
        });
        this._subscriptions.push({ name: name, sub: sub });
    }
    destroy() {
        this._subscriptions.forEach(s => s.sub.unsubscribe());
        this._subscriptions.length = 0;
        this._remove();
    }
    _createPondResponse() {
        if (!this._channel)
            throw new utils_1.PondError("Cannot create a pond response without a websocket.", 500, "PondError");
        const assigns = {
            assigns: {},
            presence: {},
            channelData: {}
        };
        const resolver = (data) => {
            if (data.error)
                throw new utils_1.PondError(data.error.errorMessage, data.error.errorCode, 'PondError');
            else if (data.message && this._channel)
                this._channel.broadcast(data.message.event, data.message.payload);
            return;
        };
        return new utils_1.PondResponse(this._channel, assigns, resolver);
    }
}
exports.LiveSocket = LiveSocket;
