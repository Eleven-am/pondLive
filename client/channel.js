"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const enums_1 = require("../server/enums");
const pubSub_1 = require("../server/utils/pubSub");
class Channel {
    channel;
    subscriptions = [];
    socket;
    params;
    subject;
    connectedSubject;
    presenceSubject = new rxjs_1.Subject();
    constructor(channel, params, socket) {
        this.channel = channel;
        this.params = params;
        this.socket = socket;
        this.subject = new rxjs_1.Subject();
        this.connectedSubject = new pubSub_1.Subject(false);
    }
    get isActive() {
        return this.connectedSubject.value;
    }
    /**
     * @desc Connects to the channel.
     */
    join() {
        if (this.connectedSubject.value)
            return this;
        const observable = this.init();
        const subscription = observable
            .subscribe(message => {
            this.connectedSubject.publish(true);
            if (message.action === 'PRESENCE')
                this.presenceSubject.next(message.payload.presence);
            else if (message.action === 'MESSAGE')
                this.subject.next(message);
            else if (message.event === 'KICKED_FROM_CHANNEL')
                this.leave();
        });
        this.subscriptions.push(subscription);
        return this;
    }
    /**
     * @desc Disconnects from the channel.
     */
    leave() {
        this.connectedSubject.publish(false);
        this.presenceSubject.complete();
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
        this.subscriptions = [];
        this.subject.complete();
    }
    /**
     * @desc Monitors the presence state of the channel.
     * @param callback - The callback to call when the presence state changes.
     */
    onPresenceUpdate(callback) {
        const sub = this.presenceSubject.subscribe(callback);
        this.subscriptions.push(sub);
        return sub;
    }
    /**
     * @desc Monitors the channel for messages.
     * @param callback - The callback to call when a message is received.
     */
    onMessage(callback) {
        const sub = this.subject
            .pipe((0, operators_1.filter)((message) => message.action === 'MESSAGE'))
            .subscribe(message => callback(message.event, message.payload));
        this.subscriptions.push(sub);
        return sub;
    }
    /**
     * @desc Broadcasts a message to the channel, including yourself.
     * @param event - The event to send.
     * @param payload - The message to send.
     */
    broadcast(event, payload) {
        const message = {
            channelName: this.channel,
            payload, event,
            action: enums_1.ClientActions.BROADCAST
        };
        this.socket.next(message);
    }
    /**
     * @desc Broadcasts a message to every other client in the channel except yourself.
     * @param event - The event to send.
     * @param payload - The message to send.
     */
    broadcastFrom(event, payload) {
        const message = {
            channelName: this.channel,
            payload, event,
            action: enums_1.ClientActions.BROADCAST_FROM
        };
        this.socket.next(message);
    }
    /**
     * @desc Updates the presence state of the current client in the channel.
     * @param presence - The presence state to update.
     */
    updatePresence(presence) {
        this.socket.next({
            action: enums_1.ClientActions.UPDATE_PRESENCE,
            channelName: this.channel,
            event: 'PRESENCE',
            payload: presence
        });
    }
    /**
     * @desc Sends a message to specific clients in the channel.
     * @param event - The event to send.
     * @param payload - The message to send.
     * @param recipient - The clients to send the message to.
     */
    sendMessage(event, payload, recipient) {
        const addresses = Array.isArray(recipient) ? recipient : [recipient];
        const message = {
            channelName: this.channel,
            payload, event, addresses,
            action: enums_1.ClientActions.SEND_MESSAGE_TO_USER
        };
        this.socket.next(message);
    }
    /**
     * @desc Listens for the connections state of the channel.
     * @param callback - The callback to call when the connection state changes.
     */
    onConnectionChange(callback) {
        const sub = this.connectedSubject.subscribe(callback);
        this.subscriptions.push(sub);
        return sub;
    }
    /**
     * @desc Initializes the channel.
     * @private
     */
    init() {
        const observable = this.socket.multiplex(() => ({
            action: 'JOIN_CHANNEL',
            channelName: this.channel,
            event: 'JOIN_CHANNEL',
            payload: this.params,
        }), () => ({
            action: 'LEAVE_CHANNEL',
            channelName: this.channel,
            event: 'LEAVE_CHANNEL',
            payload: this.params
        }), message => message.channelName === this.channel);
        return observable;
    }
}
exports.Channel = Channel;
