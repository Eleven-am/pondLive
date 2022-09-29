"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCookie = exports.setCookie = exports.parseCookies = void 0;
function parseCookies(headers) {
    const list = {};
    const cookieHeader = headers?.cookie;
    if (!cookieHeader)
        return list;
    cookieHeader.split(`;`).forEach(function (cookie) {
        let [name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name)
            return;
        const value = rest.join(`=`).trim();
        if (!value)
            return;
        list[name] = decodeURIComponent(value);
    });
    return list;
}
exports.parseCookies = parseCookies;
function setCookie(res, name, value, options = {}) {
    options = {
        path: '/',
        ...options
    };
    if (options.maxAge) {
        options.expires = new Date(Date.now() + options.maxAge);
        options.maxAge /= 1000;
    }
    if (options.expires) {
        options.expires = options.expires.toUTCString();
    }
    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }
    res.setHeader("Set-Cookie", updatedCookie);
}
exports.setCookie = setCookie;
function deleteCookie(res, name) {
    setCookie(res, name, "", {
        'max-age': -1
    });
}
exports.deleteCookie = deleteCookie;
