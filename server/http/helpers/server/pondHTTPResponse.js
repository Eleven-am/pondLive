"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondHTTPResponse = void 0;
var utils_1 = require("../../../utils");
var PondHTTPResponse = /** @class */ (function () {
    function PondHTTPResponse(response) {
        this._responseSent = false;
        this.statusCode = 200;
        this._response = response;
    }
    PondHTTPResponse.prototype.json = function (data) {
        if (this._responseSent)
            throw new utils_1.PondError('Response already sent', 500, 'PondHTTPResponse');
        this._responseSent = true;
        this._response.writeHead(this.statusCode, {
            'Content-Type': 'application/json'
        });
        this._response.end(JSON.stringify(data));
    };
    PondHTTPResponse.prototype.html = function (data) {
        if (this._responseSent)
            throw new utils_1.PondError('Response already sent', 500, 'PondHTTPResponse');
        this._responseSent = true;
        this._response.writeHead(this.statusCode, {
            'Content-Type': 'text/html'
        });
        this._response.end(data);
    };
    PondHTTPResponse.prototype.send = function (data) {
        if (this._responseSent)
            throw new utils_1.PondError('Response already sent', 500, 'PondHTTPResponse');
        this._responseSent = true;
        this._response.writeHead(this.statusCode);
        this._response.end(data);
    };
    PondHTTPResponse.prototype.redirect = function (url) {
        if (this._responseSent)
            throw new utils_1.PondError('Response already sent', 500, 'PondHTTPResponse');
        this._responseSent = true;
        this._response.writeHead(302, {
            Location: url
        });
        this._response.end();
    };
    PondHTTPResponse.prototype.setHeader = function (key, value) {
        this._response.setHeader(key, value);
        return this;
    };
    PondHTTPResponse.prototype.getHttpServerResponse = function () {
        return this._response;
    };
    PondHTTPResponse.prototype.end = function () {
        this._response.end();
    };
    PondHTTPResponse.prototype.pipe = function (stream) {
        stream.pipe(this._response);
    };
    PondHTTPResponse.prototype.status = function (code, message) {
        this._response.writeHead(code, message);
        return this;
    };
    return PondHTTPResponse;
}());
exports.PondHTTPResponse = PondHTTPResponse;
