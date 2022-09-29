"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseClass = void 0;
class BaseClass {
    /**
     * @desc checks if the pattern is matchable
     * @param pattern - the pattern to check
     */
    static isPatternMatchable(pattern) {
        return typeof pattern === 'string' && pattern.includes(':');
    }
    /**
     * @desc compares string to string | regex
     * @param string - the string to compare to the pattern
     * @param pattern - the pattern to compare to the string
     */
    compareStringToPattern(string, pattern) {
        if (typeof pattern === 'string')
            return string.split('?')[0] === pattern;
        else
            return pattern.test(string);
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
     * @desc Generates an 8 character long random string
     */
    nanoId() {
        let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return Array.from({ length: 8 })
            .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
            .join('');
    }
    /**
     * @desc Checks if the given object is empty
     * @param obj - the object to check
     */
    isObjectEmpty(obj) {
        return Object.keys(obj).length === 0;
    }
    /**
     * @desc Generates a pond request resolver object
     * @param path - the path to resolve
     * @param address - the address to resolve
     */
    generateEventRequest(path, address) {
        const match = this._matchStringToPattern(address, path);
        if (match)
            return {
                params: match, query: this._parseQueries(address), address: address
            };
        return null;
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
     * @desc Compares if two objects are equal
     * @param obj1 - the first object
     * @param obj2 - the second object
     */
    areEqual(obj1, obj2) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
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
            const response = JSON.parse((atob(encoded).toString().match(/.{1,2}/g))
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
        return btoa(token).toString();
    }
    /**
     * @desc Creates an object from the params of a path
     * @param path - the path to create the object from
     *
     * @example
     * /api/id?name=abc should return { name: 'abc' }
     * /api/id?name=abc&age=123 should return { name: 'abc', age: '123' }
     */
    _parseQueries(path) {
        const obj = {};
        const params = path.split('?')[1];
        if (params) {
            params.split('&').forEach(param => {
                const [key, value] = param.split('=');
                obj[key] = value;
            });
        }
        return obj;
    }
    /**
     * @desc Returns the {key: value} matches of a string
     * @param string - the string to create the regex from
     * @param pattern - the pattern to match
     *
     * @example
     * /api/:id should match /api/123 and return { id: 123 }
     * /api/:id/:name should match /api/123/abc and return { id: 123, name: abc }
     * hello:id should match hello:123 and return { id: 123 }
     * @private
     */
    _matchString(string, pattern) {
        const replace = pattern.replace(/:[^\/]+/g, '([^\/]+)');
        const regExp = new RegExp(`^${replace}$`);
        const matches = string.split('?')[0].match(regExp);
        if (matches) {
            const keys = pattern.match(/:[^\/]+/g);
            if (keys) {
                const obj = {};
                keys.forEach((key, index) => {
                    obj[key.replace(':', '')] = matches[index + 1].replace(/\?.*$/, '');
                });
                return obj;
            }
        }
        return null;
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
    /**
     * @desc matches a string to a pattern and returns its params if any
     * @param string - the string to match
     * @param pattern - the pattern to match to
     */
    _matchStringToPattern(string, pattern) {
        if (BaseClass.isPatternMatchable(pattern))
            return this._matchString(string, pattern);
        const valid = this.compareStringToPattern(string, pattern);
        if (valid)
            return {};
        return null;
    }
}
exports.BaseClass = BaseClass;
