"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondResponse = void 0;
const pondsocket_1 = require("@eleven-am/pondsocket");
class PondResponse extends pondsocket_1.PondResponse {
    constructor(channel) {
        super();
        this._channel = channel;
    }
    accept(_assigns) {
        // Do nothing.
    }
    reject(message, errorCode) {
        this._channel.broadcast('pond:error', {
            message: message || 'An error occurred',
            code: errorCode || 500
        });
    }
    send(event, payload, _assigns) {
        this._channel.broadcast(event, payload);
    }
}
exports.PondResponse = PondResponse;
