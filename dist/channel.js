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
exports.InternalPondChannel = void 0;
var InternalPondChannel = /** @class */ (function () {
    function InternalPondChannel(channelName, channelId, endpoint) {
        this.channelName = channelName;
        this.channelId = channelId;
        this.endpoint = endpoint;
    }
    /**
     * @desc Gets the current presence of the channel
     */
    InternalPondChannel.prototype.getPresence = function () {
        return this.endpoint.state.context.presences.toKeyValueArray().map(function (x) { return x.value; });
    };
    /**
     * @desc Gets the current channel data
     */
    InternalPondChannel.prototype.getChannelData = function () {
        return this.endpoint.state.context.channelData;
    };
    /**
     * @desc Modifies the presence state of a client on the channel
     * @param clientId - The clientId to modify the presence of
     * @param assigns - The assigns to modify the presence with
     */
    InternalPondChannel.prototype.modifyPresence = function (clientId, assigns) {
        var clientPresence = this.endpoint.state.context.presences.get(clientId);
        var clientAssigns = this.endpoint.state.context.assigns.get(clientId);
        if (clientPresence && clientAssigns) {
            var internalAssigns = __assign(__assign({}, clientAssigns), assigns.assign);
            var internalPresence = __assign(__assign({}, clientPresence), assigns.presence);
            this.endpoint.send({
                type: 'updatePresence',
                clientId: clientId,
                presence: internalPresence,
                assigns: internalAssigns,
            });
        }
    };
    /**
     * @desc Closes the channel from the given clientId
     * @param clientId - The clientId to close the channel from, can be an array of clientIds
     */
    InternalPondChannel.prototype.closeFromChannel = function (clientId) {
        this.endpoint.state.context.observable.next({
            type: 'SERVER',
            channelId: this.channelId,
            channelName: this.channelName,
            event: 'DISCONNECT_CLIENT_FROM_CHANNEL',
            addresses: Array.isArray(clientId) ? clientId : [clientId],
            payload: {}
        });
    };
    /**
     * @desc Broadcasts a message to the channel
     * @param event - The event to send the message to
     * @param message - The message to send
     */
    InternalPondChannel.prototype.broadcast = function (event, message) {
        this.endpoint.state.context.observable.next({
            type: 'SERVER',
            channelId: this.channelId,
            subEvent: event,
            channelName: this.channelName,
            event: 'BROADCAST_MESSAGE_TO_CHANNEL',
            addresses: this.endpoint.state.context.presences.toKeyValueArray().map(function (x) { return x.key; }),
            payload: message
        });
    };
    /**
     * @desc Sends a message to the channel
     * @param clientId - The clientId to send the message to, can be an array of clientIds
     * @param event - The event to send the message to
     * @param message - The message to send
     */
    InternalPondChannel.prototype.send = function (clientId, event, message) {
        this.endpoint.state.context.observable.next({
            type: 'SERVER',
            channelId: this.channelId,
            subEvent: event,
            channelName: this.channelName,
            event: 'BROADCAST_MESSAGE_TO_CHANNEL',
            addresses: Array.isArray(clientId) ? clientId : [clientId],
            payload: message
        });
    };
    return InternalPondChannel;
}());
exports.InternalPondChannel = InternalPondChannel;
