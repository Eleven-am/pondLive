"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticateUpgrade = exports.AuthenticateRequest = void 0;
var pondbase_1 = require("../../../pondbase");
var cookieHandler_1 = require("./cookieHandler");
var AuthenticateRequest = function (secret, cookie) { return function (req, res, next) {
    var _a;
    var base = new pondbase_1.BaseClass();
    var token = (0, cookieHandler_1.parseCookies)(req.headers)[cookie] || '';
    var clientId = ((_a = base.decrypt(secret, token)) === null || _a === void 0 ? void 0 : _a.time) || null;
    if (!clientId) {
        if (token) {
            (0, cookieHandler_1.deleteCookie)(res, cookie);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Unauthorized' }));
        }
        clientId = Date.now().toString();
        token = base.encrypt(secret, { time: clientId });
        (0, cookieHandler_1.setCookie)(res, cookie, token, {
            "max-age": 60 * 60 * 2,
        });
        req.clientId = clientId;
        req.token = token;
        next();
    }
    else {
        if (Date.now() - parseInt(clientId) > 1000 * 60 * 60 * 2) {
            (0, cookieHandler_1.deleteCookie)(res, cookie);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Unauthorized' }));
        }
        req.clientId = clientId;
        req.token = token;
        next();
    }
}; };
exports.AuthenticateRequest = AuthenticateRequest;
var AuthenticateUpgrade = function (secret, cookie) { return function (req, socket, _, next) {
    var _a;
    var base = new pondbase_1.BaseClass();
    var token = (0, cookieHandler_1.parseCookies)(req.headers)[cookie] || '';
    var clientId = ((_a = base.decrypt(secret, token)) === null || _a === void 0 ? void 0 : _a.time) || null;
    if (!clientId || clientId && Date.now() - parseInt(clientId) > 1000 * 60 * 60 * 2) {
        socket.write('HTTP/1.1 401 Unauthorized\r');
        socket.write('Content-Type: application/json\r');
        socket.write('\r');
        socket.write(JSON.stringify({ message: 'Unauthorized' }));
        socket.end();
    }
    else
        next();
}; };
exports.AuthenticateUpgrade = AuthenticateUpgrade;
