"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondClientSocket = void 0;
const webSocket_1 = require("rxjs/webSocket");
const rxjs_1 = require("rxjs");
const pondBase_1 = require("../server/utils/pondBase");
const channel_1 = require("./channel");
const rxjs_2 = require("rxjs");
const operators_1 = require("rxjs/operators");
class PondClientSocket {
    address;
    socketState = 'CLOSED';
    channels;
    subscription;
    socket;
    constructor(endpoint, params) {
        let address;
        try {
            address = new URL(endpoint);
        }
        catch (e) {
            address = new URL(window.location.toString());
            address.pathname = endpoint;
        }
        const query = new URLSearchParams(params);
        address.search = query.toString();
        const protocol = address.protocol === 'https:' ? 'wss:' : 'ws:';
        if (address.protocol !== 'wss:' && address.protocol !== 'ws:')
            address.protocol = protocol;
        this.address = address;
        this.channels = new pondBase_1.PondBase();
    }
    /**
     * @desc Connects to the server and returns the socket.
     */
    connect() {
        if (this.socketState !== 'CLOSED')
            return;
        this.socketState = 'CONNECTING';
        const socket = (0, webSocket_1.webSocket)({
            url: this.address.toString(),
            openObserver: {
                next: () => {
                    this.socketState = 'OPEN';
                }
            },
            closeObserver: {
                next: () => {
                    this.socketState = 'CLOSED';
                }
            },
            closingObserver: {
                next: () => {
                    this.socketState = 'CLOSING';
                }
            }
        });
        this.socket = socket;
        this.subscription = socket.pipe(this._retryStrategy(100, 1000)).subscribe();
        return this;
    }
    /**
     * @desc Returns the current state of the socket.
     */
    getState() {
        return this.socketState;
    }
    /**
     * @desc Creates a channel with the given name and params.
     * @param channel - The name of the channel.
     * @param params - The params to send to the server.
     */
    createChannel(channel, params) {
        const channelDoc = this.channels.find(c => c.channel === channel);
        if (channelDoc)
            return channelDoc.doc;
        const newChannel = new channel_1.Channel(channel, params || {}, this.socket);
        this.channels.set(newChannel);
        return newChannel;
    }
    /**
     * @desc Disconnects the socket from the server.
     */
    disconnect() {
        this.socket?.complete();
        this.socket?.unsubscribe();
        this.subscription?.unsubscribe();
        this.socket = undefined;
        this.channels = new pondBase_1.PondBase();
    }
    /**
     * @desc A retry strategy for the socket.
     * @param maxTries - The maximum number of retries.
     * @param ms - The number of milliseconds to wait before retrying.
     */
    _retryStrategy = (maxTries, ms) => {
        return (0, rxjs_2.pipe)((0, operators_1.retryWhen)(attempts => {
            const observableForRetries = (0, rxjs_2.zip)((0, rxjs_2.range)(1, maxTries), attempts)
                .pipe((0, operators_1.map)(([elemFromRange, _]) => elemFromRange), (0, operators_1.map)(i => i * i), (0, rxjs_1.switchMap)(i => (0, rxjs_2.timer)(i * ms)));
            const observableForFailure = (0, rxjs_1.throwError)(new Error('Could not connect to server'))
                .pipe((0, rxjs_1.materialize)(), (0, rxjs_1.delay)(1000), (0, rxjs_1.dematerialize)());
            return (0, rxjs_1.concat)(observableForRetries, observableForFailure);
        }));
    };
}
exports.PondClientSocket = PondClientSocket;
