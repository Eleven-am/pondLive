"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondResponse = void 0;
var pondsocket_1 = require("@eleven-am/pondsocket");
var PondResponse = /** @class */ (function (_super) {
    __extends(PondResponse, _super);
    function PondResponse(channel) {
        var _this = _super.call(this) || this;
        _this._channel = channel;
        return _this;
    }
    PondResponse.prototype.accept = function (_assigns) {
        // Do nothing.
    };
    PondResponse.prototype.reject = function (message, errorCode) {
        this._channel.broadcast('pond:error', {
            message: message || 'An error occurred',
            code: errorCode || 500
        });
    };
    PondResponse.prototype.send = function (event, payload, _assigns) {
        this._channel.broadcast(event, payload);
    };
    return PondResponse;
}(pondsocket_1.PondResponse));
exports.PondResponse = PondResponse;
