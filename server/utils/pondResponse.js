"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondResponse = void 0;
const basePromise_1 = require("./basePromise");
class PondResponse {
    _executed;
    _data;
    _isChannel;
    _assigns;
    _message;
    _error;
    resolver;
    constructor(data, assigns, resolver, isChannel = true) {
        this._executed = false;
        this._data = data;
        this.resolver = resolver;
        this._assigns = assigns;
        this._isChannel = isChannel;
    }
    /**
     * @desc Emits a direct message to the client
     * @param event - the event name
     * @param payload - the payload to send
     * @param assigns - the data to assign to the client
     */
    send(event, payload, assigns) {
        this._message = {
            event: event,
            payload: payload,
        };
        return this._execute(assigns);
    }
    /**
     * @desc Accepts the request and optionally assigns data to the client
     * @param assigns - the data to assign to the client
     */
    accept(assigns) {
        return this._execute(assigns);
    }
    /**
     * @desc Rejects the request with the given error message
     * @param message - the error message
     * @param errorCode - the error code
     */
    reject(message, errorCode) {
        message = message || (this._isChannel ? 'Message' : 'Connection') + ' rejected';
        errorCode = errorCode || 403;
        this._error = {
            errorMessage: message,
            errorCode: errorCode,
        };
        return this._execute({});
    }
    /**
     * @desc Executes the response callback
     * @param assigns - the data to assign to the client
     * @private
     */
    _execute(assigns) {
        if (!this._executed) {
            this._executed = true;
            const data = {
                assigns: this._mergeAssigns(assigns),
                message: this._message,
                error: this._error,
            };
            this.resolver(data);
        }
        else
            throw new basePromise_1.PondError('Response has already been sent', 500, this._data);
    }
    /**
     * @desc Merges the assigns with the default assigns
     * @param data - the data to merge
     * @private
     */
    _mergeAssigns(data) {
        if (data === undefined)
            return this._assigns;
        const otherAssigns = data;
        const newAssigns = this._assigns;
        const presence = { ...newAssigns.presence, ...otherAssigns.presence };
        const channelData = { ...newAssigns.channelData, ...otherAssigns.channelData };
        const assigns = { ...newAssigns.assigns, ...otherAssigns.assigns };
        return {
            presence: presence,
            channelData: channelData,
            assigns: assigns,
        };
    }
}
exports.PondResponse = PondResponse;
