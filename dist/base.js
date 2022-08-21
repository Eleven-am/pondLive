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
exports.BaseMap = exports.BasePromise = exports.PondError = exports.BaseClass = void 0;
var BaseClass = /** @class */ (function () {
    function BaseClass() {
    }
    /**
     * @desc creates an uuid v4 string
     */
    BaseClass.prototype.createUUID = function () {
        var dt = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    };
    /**
     * @desc encodes an object using into a string using it's secret key
     * @param salt - the secret key
     * @param text - the object to encode
     */
    BaseClass.prototype.encrypt = function (salt, text) {
        var textToChars = function (text) { return text.split("").map(function (c) { return c.charCodeAt(0); }); };
        var byteHex = function (n) { return ("0" + Number(n).toString(16)).substr(-2); };
        var applySaltToChar = function (code) { return textToChars(salt).reduce(function (a, b) { return a ^ b; }, code); };
        var token = JSON.stringify(text)
            .split("")
            .map(textToChars)
            .map(applySaltToChar)
            .map(byteHex)
            .join("");
        return btoa(token).toString();
    };
    return BaseClass;
}());
exports.BaseClass = BaseClass;
var PondError = /** @class */ (function () {
    function PondError(errorMessage, errorCode, data) {
        this.errorMessage = errorMessage;
        this.errorCode = errorCode;
        this.data = data;
    }
    ;
    return PondError;
}());
exports.PondError = PondError;
function BasePromise(callback) {
    return new Promise(function (resolve, reject) {
        var myReject = function (errorMessage, errorCode, data) {
            reject(new PondError(errorMessage, errorCode, data));
        };
        callback(resolve, myReject);
    });
}
exports.BasePromise = BasePromise;
var BaseMap = /** @class */ (function () {
    function BaseMap(entries) {
        if (entries instanceof BaseMap)
            this.map = entries.map;
        else if (entries instanceof Map)
            this.map = new Map(entries);
        else if (Array.isArray(entries))
            this.map = new Map(entries);
        else
            this.map = new Map();
    }
    BaseMap.prototype.set = function (key, value) {
        return this.map.set(key, value);
    };
    BaseMap.prototype.get = function (key) {
        return this.map.get(key);
    };
    BaseMap.prototype.has = function (key) {
        return this.map.has(key);
    };
    BaseMap.prototype.keys = function () {
        return this.map.keys();
    };
    BaseMap.prototype.toArray = function () {
        return Array.from(this.map.entries(), function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            return (__assign({ id: key }, value));
        });
    };
    BaseMap.prototype.toKeyValueArray = function () {
        return Array.from(this.map.entries(), function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            return ({ key: key, value: value });
        });
    };
    BaseMap.prototype.deleteKey = function (key) {
        this.map.delete(key);
        return this;
    };
    BaseMap.prototype.allExcept = function () {
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        var cache = [];
        Array.from(this.map.entries(), function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            if (keys.indexOf(key) === -1)
                cache.push(__assign({ id: key }, value));
        }).filter(function (x) { return x; });
        return cache;
    };
    return BaseMap;
}());
exports.BaseMap = BaseMap;
