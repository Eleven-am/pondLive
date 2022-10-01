"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.html = exports.HtmlSafeString = exports.safe = exports.join = void 0;
var deepDiff_1 = require("./deepDiff");
var getChanged_1 = require("./getChanged");
var utils_1 = require("../../../utils");
var ENTITIES = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
};
var ENT_REGEX = new RegExp(Object.keys(ENTITIES).join('|'), 'g');
function join(array, separator) {
    if (separator === undefined || separator === null) {
        separator = ',';
    }
    if (array.length <= 0) {
        return new HtmlSafeString([''], []);
    }
    return new HtmlSafeString(__spreadArray(__spreadArray([''], __read(Array(array.length - 1).fill(separator)), false), [''], false), array);
}
exports.join = join;
function safe(value) {
    return new HtmlSafeString([String(value)], []);
}
exports.safe = safe;
function escapeHTML(unsafe) {
    if (unsafe instanceof HtmlSafeString) {
        return unsafe.toString();
    }
    if (Array.isArray(unsafe)) {
        return join(unsafe, '').toString();
    }
    return String(unsafe).replace(ENT_REGEX, function (char) { return ENTITIES[char]; });
}
var HtmlSafeString = /** @class */ (function () {
    function HtmlSafeString(statics, dynamics) {
        this.statics = statics;
        this.dynamics = dynamics;
    }
    HtmlSafeString.prototype.toString = function () {
        var result = this.statics[0];
        for (var i = 0; i < this.dynamics.length; i++) {
            result += escapeHTML(this.dynamics[i]) + this.statics[i + 1];
        }
        return result;
    };
    HtmlSafeString.prototype.getParts = function () {
        var result = {
            s: this.statics
        };
        for (var i = 0; i < this.dynamics.length; i++)
            if (this.dynamics[i] instanceof HtmlSafeString)
                result[i] = this.dynamics[i].getParts();
            else if (Array.isArray(this.dynamics[i]))
                result[i] = join(this.dynamics[i], '').getParts();
            else {
                if (this.dynamics[i] === undefined)
                    throw new utils_1.PondError('undefined value in html', 500, 'render');
                result[i] = this.dynamics[i];
            }
        return result;
    };
    HtmlSafeString.prototype.parsedHtmlToString = function (parsed) {
        var data = parsed;
        var result = '';
        if (Array.isArray(data))
            return join(data, '').toString();
        if (data.s) {
            result = data.s[0];
            for (var i = 0; i < data.s.length - 1; i++) {
                if (typeof data[i] === 'object')
                    result += this.parsedHtmlToString(parsed[i]) + data.s[i + 1];
                else
                    result += escapeHTML(parsed[i]) + data.s[i + 1];
            }
        }
        return result;
    };
    HtmlSafeString.prototype.differentiate = function (parsed) {
        var newParsed = parsed.getParts();
        var oldParsed = this.getParts();
        var mapped = (0, deepDiff_1.DeepDiffMapper)(oldParsed, newParsed);
        return (0, getChanged_1.getChanges)(mapped);
    };
    return HtmlSafeString;
}());
exports.HtmlSafeString = HtmlSafeString;
function html(statics) {
    var dynamics = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        dynamics[_i - 1] = arguments[_i];
    }
    return new HtmlSafeString(statics, dynamics);
}
exports.html = html;
