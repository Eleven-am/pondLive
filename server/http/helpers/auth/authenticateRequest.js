"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticateUpgrade = exports.AuthenticateRequest = void 0;
const utils_1 = require("../../../utils");
const cookieHandler_1 = require("./cookieHandler");
const AuthenticateRequest = (secret, cookie) => (req, res, next) => {
    const base = new utils_1.BaseClass();
    let token = (0, cookieHandler_1.parseCookies)(req.headers)[cookie] || '';
    let clientId = base.decrypt(secret, token)?.time || null;
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
};
exports.AuthenticateRequest = AuthenticateRequest;
const AuthenticateUpgrade = (secret, cookie) => (req, socket, _, next) => {
    const base = new utils_1.BaseClass();
    let token = (0, cookieHandler_1.parseCookies)(req.headers)[cookie] || '';
    let clientId = base.decrypt(secret, token)?.time || null;
    if (!clientId || clientId && Date.now() - parseInt(clientId) > 1000 * 60 * 60 * 2) {
        socket.write('HTTP/1.1 401 Unauthorized\r');
        socket.write('Content-Type: application/json\r');
        socket.write('\r');
        socket.write(JSON.stringify({ message: 'Unauthorized' }));
        socket.end();
    }
    else
        next();
};
exports.AuthenticateUpgrade = AuthenticateUpgrade;
