"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthorizer = exports.AuthorizeUpgrade = exports.AuthorizeRequest = exports.pondAuthorizer = exports.parseCookies = void 0;
const response_1 = require("../expressConfig/response");
const baseClass_1 = require("../../utils/baseClass");
const parseCookies = (headers) => {
    const list = {}, rc = headers.cookie;
    rc && rc.split(';').forEach(function (cookie) {
        var _a;
        const parts = cookie.split('=');
        list[((_a = parts.shift()) === null || _a === void 0 ? void 0 : _a.trim()) || ''] = decodeURI(parts.join('='));
    });
    return list;
};
exports.parseCookies = parseCookies;
const pondAuthorizer = (secret, cookie) => {
    return (request) => {
        var _a;
        let token = (0, exports.parseCookies)(request)[cookie] || null;
        let clientId = ((_a = new baseClass_1.BaseClass().decrypt(secret, token || '')) === null || _a === void 0 ? void 0 : _a.time) || null;
        if (!clientId) {
            if (token)
                return { clientId: null, token: null, clearToken: true };
            clientId = Date.now().toString();
            token = new baseClass_1.BaseClass().encrypt(secret, { time: clientId });
            return { clientId, token, setToken: true };
        }
        if (Date.now() - parseInt(clientId) > 1000 * 60 * 60 * 2)
            return {
                clientId: null,
                token: null,
                valid: false,
                clearToken: true,
            };
        return { clientId, token };
    };
};
exports.pondAuthorizer = pondAuthorizer;
const AuthorizeRequest = (secret, cookie, authorizer = (0, exports.pondAuthorizer)(secret, cookie)) => {
    return (req, res, next) => {
        req.auth = { clientId: null, token: null };
        res = (0, response_1.applyResponse)(res);
        const { clientId, token, setToken, clearToken } = authorizer(req.headers);
        if (clearToken) {
            res.clearCookie(cookie);
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!clientId)
            return res.status(401).json({ message: 'Unauthorized' });
        if (setToken && token) {
            res.setCookie(cookie, token, {
                maxAge: 1000 * 60 * 60 * 2,
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
            });
        }
        req.auth.clientId = clientId;
        req.auth.token = token;
        next();
    };
};
exports.AuthorizeRequest = AuthorizeRequest;
const AuthorizeUpgrade = (secret, cookie, authorizer = (0, exports.pondAuthorizer)(secret, cookie)) => {
    const base = new baseClass_1.BaseClass();
    return (req, response) => {
        const { clientId } = authorizer(req.headers);
        if (!clientId)
            return response.reject('Unauthorized', 401);
        const newToken = {
            token: base.uuid(), clientId: clientId, timestamp: Date.now()
        };
        const csrfToken = base.encrypt(secret, newToken);
        const nanoId = base.nanoId();
        return response.send('token', { csrfToken, nanoId }, {
            assigns: {
                csrfToken, clientId, nanoId
            },
        });
    };
};
exports.AuthorizeUpgrade = AuthorizeUpgrade;
const getAuthorizer = (secret, cookie, authorizer) => {
    return authorizer || (0, exports.pondAuthorizer)(secret, cookie);
};
exports.getAuthorizer = getAuthorizer;
