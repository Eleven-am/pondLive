"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondClientSocket = void 0;
var webSocket_1 = require("rxjs/webSocket");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var utils_1 = require("../server/utils");
var PondClientSocket = /** @class */ (function () {
    function PondClientSocket(endpoint, params) {
        var _a, _b;
        this.socketState = 'CLOSED';
        var address = new URL(endpoint);
        var query = new URLSearchParams(params);
        address.search = query.toString();
        this.address = address;
        this.channels = new utils_1.BaseMap();
        if ((_a = window.pond) === null || _a === void 0 ? void 0 : _a.has(this.address.toString())) {
            (_b = window.pond.get(this.address.toString())) === null || _b === void 0 ? void 0 : _b.disconnect();
            window.pond.set(this.address.toString(), this);
        }
        else {
            window.pond = window.pond || new utils_1.BaseMap();
            window.pond.set(this.address.toString(), this);
        }
    }
    /**
     * @desc Connects to the server and returns the socket.
     */
    PondClientSocket.prototype.connect = function () {
        var _this = this;
        var _a;
        if (this.socketState !== 'CLOSED')
            return;
        this.socketState = 'CONNECTING';
        var windowPond = (_a = window.pond) === null || _a === void 0 ? void 0 : _a.get(this.address.toString());
        var socket = (windowPond === null || windowPond === void 0 ? void 0 : windowPond.socket) || (0, webSocket_1.webSocket)({
            url: this.address.toString(),
            openObserver: {
                next: function () {
                    _this.socketState = 'OPEN';
                }
            },
            closeObserver: {
                next: function () {
                    _this.socketState = 'CLOSED';
                }
            },
            closingObserver: {
                next: function () {
                    _this.socketState = 'CLOSING';
                }
            }
        });
        this.socket = socket;
        this.subscription = socket.subscribe();
        return this;
    };
    /**
     * @desc Returns the current state of the socket.
     */
    PondClientSocket.prototype.getState = function () {
        return this.socketState;
    };
    /**
     * @desc Creates a channel with the given name and params.
     * @param channel - The name of the channel.
     * @param params - The params to send to the server.
     */
    PondClientSocket.prototype.createChannel = function (channel, params) {
        var _a;
        if (this.channels.has(channel) && ((_a = this.channels.get(channel)) === null || _a === void 0 ? void 0 : _a.isActive))
            return this.channels.get(channel);
        var newChannel = new Channel(channel, params, this.socket);
        this.channels.set(channel, newChannel);
        return newChannel;
    };
    /**
     * @desc Disconnects the socket from the server.
     */
    PondClientSocket.prototype.disconnect = function () {
        var _a, _b, _c;
        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.complete();
        (_b = this.socket) === null || _b === void 0 ? void 0 : _b.unsubscribe();
        (_c = this.subscription) === null || _c === void 0 ? void 0 : _c.unsubscribe();
        this.socket = undefined;
        this.channels = new utils_1.BaseMap();
    };
    return PondClientSocket;
}());
exports.PondClientSocket = PondClientSocket;
var Channel = /** @class */ (function () {
    function Channel(channel, params, socket) {
        this.presenceSubject = new rxjs_1.Subject();
        this.channel = channel;
        this.params = params;
        this.socket = socket;
        this.connectedSubject = new rxjs_1.BehaviorSubject(false);
        this.subject = new rxjs_1.Subject();
    }
    Object.defineProperty(Channel.prototype, "isActive", {
        get: function () {
            return !this.connectedSubject.isStopped;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @desc Connects to the channel.
     */
    Channel.prototype.join = function () {
        var _this = this;
        if (this.connectedSubject.value)
            return;
        this.connectedSubject.next(true);
        var observable = this.init();
        this.subscription = observable
            .subscribe(function (message) {
            if (message.action === 'PRESENCE')
                _this.presenceSubject.next(message.payload.presence);
            else if (message.action === 'MESSAGE')
                _this.subject.next(message);
            else if (message.event === 'KICKED_FROM_CHANNEL')
                _this.leave();
        });
    };
    /**
     * @desc Disconnects from the channel.
     */
    Channel.prototype.leave = function () {
        var _a;
        this.connectedSubject.next(false);
        this.connectedSubject.complete();
        this.presenceSubject.complete();
        (_a = this.subscription) === null || _a === void 0 ? void 0 : _a.unsubscribe();
        this.subscription = undefined;
        this.subject.complete();
    };
    /**
     * @desc Monitors the presence state of the channel.
     * @param callback - The callback to call when the presence state changes.
     */
    Channel.prototype.onPresenceUpdate = function (callback) {
        this.presenceSubject.subscribe(callback);
    };
    /**
     * @desc Monitors the channel for messages.
     * @param callback - The callback to call when a message is received.
     */
    Channel.prototype.onMessage = function (callback) {
        this.subject
            .pipe((0, operators_1.filter)(function (message) { return message.action === 'MESSAGE'; }))
            .subscribe(function (message) { return callback(message.event, message.payload); });
    };
    /**
     * @desc Broadcasts a message to the channel, including yourself.
     * @param event - The event to send.
     * @param message - The message to send.
     */
    Channel.prototype.broadcast = function (event, message) {
        this.socket.next({
            action: 'BROADCAST',
            channelName: this.channel,
            event: event,
            payload: message
        });
    };
    /**
     * @desc Broadcasts a message to every other client in the channel except yourself.
     * @param event - The event to send.
     * @param message - The message to send.
     */
    Channel.prototype.broadcastFrom = function (event, message) {
        this.socket.next({
            action: 'BROADCAST_FROM',
            channelName: this.channel,
            event: event,
            payload: message
        });
    };
    /**
     * @desc Updates the presence state of the current client in the channel.
     * @param presence - The presence state to update.
     */
    Channel.prototype.updatePresence = function (presence) {
        this.socket.next({
            action: 'UPDATE_PRESENCE',
            channelName: this.channel,
            event: 'PRESENCE',
            payload: presence
        });
    };
    /**
     * @desc Sends a message to specific clients in the channel.
     * @param event - The event to send.
     * @param message - The message to send.
     * @param to - The clients to send the message to.
     */
    Channel.prototype.sendMessage = function (event, message, to) {
        this.socket.next({
            action: 'SEND_MESSAGE_TO_USER',
            channelName: this.channel,
            event: event,
            payload: message,
            addresses: to
        });
    };
    /**
     * @desc Listens for the connections state of the channel.
     * @param callback - The callback to call when the connection state changes.
     */
    Channel.prototype.onConnectionChange = function (callback) {
        this.connectedSubject.subscribe(callback);
    };
    /**
     * @desc Initializes the channel.
     * @private
     */
    Channel.prototype.init = function () {
        var _this = this;
        var observable = this.socket.multiplex(function () { return ({
            action: 'JOIN_CHANNEL',
            channelName: _this.channel,
            event: 'JOIN_CHANNEL',
            payload: _this.params,
        }); }, function () { return ({
            action: 'LEAVE_CHANNEL',
            channelName: _this.channel,
            event: 'LEAVE_CHANNEL',
            payload: _this.params
        }); }, function (message) { return message.channelName === _this.channel; });
        return observable;
    };
    return Channel;
}());
