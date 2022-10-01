"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCookie = exports.setCookie = exports.parseCookies = void 0;
function parseCookies(headers) {
    var list = {};
    var cookieHeader = headers === null || headers === void 0 ? void 0 : headers.cookie;
    if (!cookieHeader)
        return list;
    cookieHeader.split(";").forEach(function (cookie) {
        var _a = __read(cookie.split("=")), name = _a[0], rest = _a.slice(1);
        name = name === null || name === void 0 ? void 0 : name.trim();
        if (!name)
            return;
        var value = rest.join("=").trim();
        if (!value)
            return;
        list[name] = decodeURIComponent(value);
    });
    return list;
}
exports.parseCookies = parseCookies;
function setCookie(res, name, value, options) {
    if (options === void 0) { options = {}; }
    options = __assign({ path: '/' }, options);
    if (options.maxAge) {
        options.expires = new Date(Date.now() + options.maxAge);
        options.maxAge /= 1000;
    }
    if (options.expires) {
        options.expires = options.expires.toUTCString();
    }
    var updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
    for (var optionKey in options) {
        updatedCookie += "; " + optionKey;
        var optionValue = options[optionKey];
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
