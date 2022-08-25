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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
    BaseClass.prototype.uuid = function () {
        var dt = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    };
    /**
     * @desc compares string to string | regex
     * @param string - the string to compare to the pattern
     * @param pattern - the pattern to compare to the string
     */
    BaseClass.prototype.compareStringToPattern = function (string, pattern) {
        if (typeof pattern === 'string')
            return string === pattern;
        else {
            return pattern.test(string);
        }
    };
    /**
     * @desc replaces an object in an array with the new object by a specified key
     * @param array - the array to replace the object in
     * @param key - the key to search for in the array
     * @param newObject - the new object to replace the old one with
     */
    BaseClass.prototype.replaceObjectInArray = function (array, key, newObject) {
        return array.map(function (item) {
            if (item[key] === newObject[key]) {
                return newObject;
            }
            else {
                return item;
            }
        });
    };
    /**
     * @desc generates a pond response given the data, resolve and reject functions
     * @param data - the data to return to the response
     * @param resolve - the resolve function to call when the response is accepted
     * @param rejected - the reject function to call when the response is rejected
     */
    BaseClass.prototype.generatePondResponse = function (resolve, rejected, data) {
        var accept = function (data) {
            var assigns = (data === null || data === void 0 ? void 0 : data.assign) || {};
            var presence = (data === null || data === void 0 ? void 0 : data.presence) || {};
            resolve({
                assign: assigns,
                presence: presence,
            });
        };
        var reject = function (message, statusCode) {
            rejected(message || 'Something went wrong', statusCode || 500, data);
        };
        return {
            accept: accept,
            reject: reject,
        };
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
function BasePromise(callback, data) {
    var _this = this;
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var validated, myReject, myResolve, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validated = false;
                    myReject = function (errorMessage, errorCode, data) {
                        validated = true;
                        reject(new PondError(errorMessage, errorCode, data));
                    };
                    myResolve = function (value) {
                        validated = true;
                        resolve(value);
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, callback(myResolve, myReject)];
                case 2:
                    _a.sent();
                    if (!validated)
                        reject(new PondError('Function did not resolve a Promise', 500, data));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    reject(new PondError(error_1.message, 500, data));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
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
    BaseMap.prototype.find = function (callback) {
        var cache = this.toKeyValueArray();
        return cache.find(function (item) { return callback(item.value); });
    };
    BaseMap.prototype.findByKey = function (callback) {
        var cache = this.toKeyValueArray();
        return cache.find(function (item) { return callback(item.key); });
    };
    BaseMap.prototype.toArrayMap = function (callback) {
        var cache = this.toKeyValueArray();
        return cache.map(function (item) { return callback([item.key, item.value]); });
    };
    return BaseMap;
}());
exports.BaseMap = BaseMap;
