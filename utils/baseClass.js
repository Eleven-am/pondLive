"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseClass = void 0;
const base_1 = require("@eleven-am/pondsocket/base");
const buffer_1 = require("buffer");
class BaseClass extends base_1.BaseClass {
    constructor() {
        super();
    }
    /**
     * @desc creates an uuid v4 string
     */
    uuid() {
        let dt = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
    /**
     * @desc decodes a string using it's secret key
     * @param salt - the secret key
     * @param encoded - the encoded string
     */
    decrypt(salt, encoded) {
        const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
        const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
        try {
            const response = JSON.parse((buffer_1.Buffer.from(encoded, 'base64').toString()
                .match(/.{1,2}/g))
                .map((hex) => parseInt(hex, 16))
                .map(applySaltToChar)
                .map((charCode) => String.fromCharCode(charCode))
                .join(""));
            return response;
        }
        catch (e) {
            return null;
        }
    }
    /**
     * @desc encodes an object using into a string using it's secret key
     * @param salt - the secret key
     * @param text - the object to encode
     */
    encrypt(salt, text) {
        const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
        const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
        const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
        const token = JSON.stringify(text)
            .split("")
            .map(textToChars)
            .map(applySaltToChar)
            .map(byteHex)
            .join("");
        return buffer_1.Buffer.from(token).toString('base64');
    }
    /**
     * @desc Matches a string to a pattern
     * @param path - the path to match
     * @param address - the address to match
     */
    getLiveRequest(path, address) {
        const match = this._matchPartialPattern(address, path);
        if (match)
            return {
                params: match.params, query: this._parseQueries(address), nextPath: match.rest, address: address
            };
        return null;
    }
    /**
     * @desc Generates an 8 character long random string
     */
    nanoId() {
        let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return Array.from({ length: 8 })
            .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
            .join('');
    }
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
    _matchPartialPattern(string, pattern) {
        if (BaseClass.isPatternMatchable(pattern)) {
            const regex = new RegExp(pattern.replace(/:[^\/]+/g, '([^\/?]+)'));
            const matches = string.match(regex);
            if (matches) {
                const keys = pattern.match(/:[^\/]+/g);
                if (keys) {
                    const obj = {};
                    keys.forEach((key, index) => {
                        obj[key.replace(':', '')] = matches[index + 1].replace(/\?.*$/, '');
                    });
                    return {
                        params: obj, rest: string.replace(matches[0], '')
                    };
                }
            }
        }
        const valid = this.compareStringToPattern(string, pattern);
        if (valid)
            return { params: {}, rest: '' };
        if (string.startsWith(pattern)) {
            return { params: {}, rest: string.replace(pattern, '') };
        }
        return null;
    }
}
exports.BaseClass = BaseClass;
