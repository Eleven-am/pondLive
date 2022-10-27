"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveSocket = void 0;
const liveRouter_1 = require("./liveRouter");
const pondResponse_1 = require("../utils/pondResponse");
class LiveSocket {
    constructor(clientId, manager, remove) {
        this._liveContext = {};
        this.clientId = clientId;
        this._subscriptions = [];
        this._manager = manager;
        this._channel = null;
        this._isWebsocket = false;
        this._remove = remove;
        this._timer = null;
    }
    /**
     * @desc The type of the live socket.
     */
    get isWebsocket() {
        return this._isWebsocket;
    }
    /**
     * @desc The live context.
     */
    get context() {
        this._clearTimer();
        const result = { ...this._liveContext };
        return Object.freeze(result);
    }
    /**
     * @desc Assigns a value to the live context.
     * @param assign - The data to assign.
     */
    assign(assign) {
        if (!this._isWebsocket) {
            this._clearTimer();
            this._liveContext = { ...this._liveContext, ...assign };
            return;
        }
        this._reRender(() => {
            this._liveContext = Object.assign(this._liveContext, assign);
        });
    }
    /**
     * @desc Emits an event on the browser window.
     * @param event - The event name.
     * @param data - The data to emit.
     */
    emit(event, data) {
        this._clearTimer();
        if (this._channel)
            this._channel.broadcast('emit', { event, data });
    }
    /**
     * @desc Destroys the live socket.
     */
    destroy(force = false) {
        if (!force) {
            this._clearTimer();
            this._timer = setTimeout(() => {
                this._subscriptions.forEach(s => s.subscription.unsubscribe());
                this._subscriptions.length = 0;
                this._remove();
            }, 5000);
        }
        else {
            this._subscriptions.forEach(s => s.subscription.unsubscribe());
            this._subscriptions.length = 0;
            this._remove();
        }
    }
    /**
     * @desc Creates a socket response object.
     */
    createResponse() {
        this._clearTimer();
        const response = this._createPondResponse();
        const router = new liveRouter_1.LiveRouter(response);
        return { response, router };
    }
    /**
     * @desc Upgrades the live socket to a websocket.
     * @param channel - The websocket channel.
     */
    upgradeToWebsocket(channel) {
        this._clearTimer();
        this._isWebsocket = true;
        this._channel = channel;
    }
    /**
     * @desc Handles a message from a Broadcast channel.
     * @param info - The message info.
     */
    async onMessage(info) {
        await this._reRender(async (component, router) => {
            var _a;
            if (!router)
                return;
            await ((_a = component.onInfo) === null || _a === void 0 ? void 0 : _a.call(this._liveContext, info, this, router));
        });
    }
    /**
     * @desc Handles the context change of a context manager.
     * @param context - The new context.
     */
    async onContextChange(context) {
        await this._reRender(async (component, router) => {
            var _a;
            await ((_a = component.onContextChange) === null || _a === void 0 ? void 0 : _a.call(this._liveContext, context, this, router));
        });
    }
    /**
     * @desc Subscribes to a context provider.
     * @param provider - The context provider.
     */
    subscribeToContextManager(provider) {
        const data = provider.pullContext(this);
        const isPresent = this._subscriptions.some(s => s.contextType === 'CONTEXT_PROVIDER' && s.contextId === data.contextId);
        if (isPresent)
            return;
        const subscription = provider.mountSocket(this);
        this._subscriptions.push({ subscription, contextType: 'CONTEXT_PROVIDER', contextId: data.contextId });
    }
    /**
     * @desc Subscribes to a broadcast channel.
     * @param channel - The broadcast channel to subscribe to.
     * @param contextId - The context id of the channel.
     */
    subscribeToBroadcastChannel(channel, contextId) {
        const isPresent = this._subscriptions.some(s => s.contextType === 'BROADCAST_CHANNEL' && s.contextId === contextId);
        if (isPresent)
            return;
        const subscription = channel.mountSocket(this);
        this._subscriptions.push({ subscription, contextType: 'BROADCAST_CHANNEL', contextId });
    }
    /**
     * @desc Handles the upload complete event from the file uploader.
     * @param uploadEvent - The upload event.
     */
    async onUpload(uploadEvent) {
        await this._reRender(async (component, router) => {
            var _a;
            (_a = component.onUpload) === null || _a === void 0 ? void 0 : _a.call(this._liveContext, uploadEvent, this, router);
        });
    }
    /**
     * @desc Creates a socket response object.
     */
    _createPondResponse() {
        if (!this._channel)
            throw new Error('Cannot create a response without a channel.');
        return new pondResponse_1.PondResponse(this._channel);
    }
    /**
     * @desc Clears the timer.
     * @private
     */
    _clearTimer() {
        if (this._timer)
            clearTimeout(this._timer);
    }
    /**
     * @desc Re-renders the component.
     * @param callback - The callback to run before re-rendering.
     * @private
     */
    async _reRender(callback) {
        this._clearTimer();
        if (!this._isWebsocket)
            return;
        const response = this._createPondResponse();
        const router = new liveRouter_1.LiveRouter(response);
        await this._manager.manageSocketRender(this, router, response, component => {
            callback(component, router);
        });
    }
}
exports.LiveSocket = LiveSocket;
