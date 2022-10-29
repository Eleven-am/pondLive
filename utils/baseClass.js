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
exports.BaseClass = void 0;
var base_1 = require("@eleven-am/pondsocket/base");
var buffer_1 = require("buffer");
var BaseClass = /** @class */ (function (_super) {
    __extends(BaseClass, _super);
    function BaseClass() {
        return _super.call(this) || this;
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
     * @desc decodes a string using it's secret key
     * @param salt - the secret key
     * @param encoded - the encoded string
     */
    BaseClass.prototype.decrypt = function (salt, encoded) {
        var textToChars = function (text) { return text.split("").map(function (c) { return c.charCodeAt(0); }); };
        var applySaltToChar = function (code) { return textToChars(salt).reduce(function (a, b) { return a ^ b; }, code); };
        try {
            var response = JSON.parse((buffer_1.Buffer.from(encoded, 'base64').toString()
                .match(/.{1,2}/g))
                .map(function (hex) { return parseInt(hex, 16); })
                .map(applySaltToChar)
                .map(function (charCode) { return String.fromCharCode(charCode); })
                .join(""));
            return response;
        }
        catch (e) {
            return null;
        }
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
        return buffer_1.Buffer.from(token).toString('base64');
    };
    /**
     * @desc Matches a string to a pattern
     * @param path - the path to match
     * @param address - the address to match
     */
    BaseClass.prototype.getLiveRequest = function (path, address) {
        var match = this._matchPartialPattern(address, path);
        if (match)
            return {
                params: match.params, query: this._parseQueries(address), nextPath: match.rest, address: address
            };
        return null;
    };
    /**
     * @desc Generates an 8 character long random string
     */
    BaseClass.prototype.nanoId = function () {
        var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return Array.from({ length: 8 })
            .map(function () { return chars.charAt(Math.floor(Math.random() * chars.length)); })
            .join('');
    };
    /**
     * @desc Returns the {key: value} matches of a string
     * @param string - the string to create the regex from
     * @param pattern - the pattern to match
     *
     * @example
     * /:id should match /123 and return { id: 123, rest: '' }
     * /:id should match /123/abc and return { id: 123, rest: /abc }
     * /:id/:name should match /123/abc and return { id: 123, name: abc, rest: '' }
     * /:id/:name should match /123/abc/def and return { id: 123, name: abc, rest: /def }
     * /name/:id should match /name/123 and return { id: 123, rest: '' }
     * /name should match /name/123 and return { rest: /123 }
     * @private
     */
    BaseClass.prototype._matchPartialPattern = function (string, pattern) {
        if (BaseClass.isPatternMatchable(pattern)) {
            var regex = new RegExp(pattern.replace(/:[^\/]+/g, '([^\/?]+)'));
            var matches_1 = string.match(regex);
            if (matches_1) {
                var keys = pattern.match(/:[^\/]+/g);
                if (keys) {
                    var obj_1 = {};
                    keys.forEach(function (key, index) {
                        obj_1[key.replace(':', '')] = matches_1[index + 1].replace(/\?.*$/, '');
                    });
                    return {
                        params: obj_1, rest: string.replace(matches_1[0], '')
                    };
                }
            }
        }
        var valid = this.compareStringToPattern(string, pattern);
        if (valid)
            return { params: {}, rest: '' };
        if (string.startsWith(pattern)) {
            return { params: {}, rest: string.replace(pattern, '') };
        }
        return null;
    };
    return BaseClass;
}(base_1.BaseClass));
exports.BaseClass = BaseClass;
