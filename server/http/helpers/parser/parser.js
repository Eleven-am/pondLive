"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.html = exports.HtmlSafeString = exports.safe = exports.join = void 0;
const deepDiff_1 = require("./deepDiff");
const getChanged_1 = require("./getChanged");
const utils_1 = require("../../../utils");
const ENTITIES = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
};
const ENT_REGEX = new RegExp(Object.keys(ENTITIES).join('|'), 'g');
function join(array, separator) {
    if (separator === undefined || separator === null) {
        separator = ',';
    }
    if (array.length <= 0) {
        return new HtmlSafeString([''], []);
    }
    return new HtmlSafeString(['', ...Array(array.length - 1).fill(separator), ''], array);
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
    return String(unsafe).replace(ENT_REGEX, (char) => ENTITIES[char]);
}
class HtmlSafeString {
    statics;
    dynamics;
    constructor(statics, dynamics) {
        this.statics = statics;
        this.dynamics = dynamics;
    }
    toString() {
        let result = this.statics[0];
        for (let i = 0; i < this.dynamics.length; i++) {
            result += escapeHTML(this.dynamics[i]) + this.statics[i + 1];
        }
        return result;
    }
    getParts() {
        const result = {
            s: this.statics
        };
        for (let i = 0; i < this.dynamics.length; i++)
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
    }
    parsedHtmlToString(parsed) {
        const data = parsed;
        let result = '';
        if (Array.isArray(data))
            return join(data, '').toString();
        if (data.s) {
            result = data.s[0];
            for (let i = 0; i < data.s.length - 1; i++) {
                if (typeof data[i] === 'object')
                    result += this.parsedHtmlToString(parsed[i]) + data.s[i + 1];
                else
                    result += escapeHTML(parsed[i]) + data.s[i + 1];
            }
        }
        return result;
    }
    differentiate(parsed) {
        const newParsed = parsed.getParts();
        const oldParsed = this.getParts();
        const mapped = (0, deepDiff_1.DeepDiffMapper)(oldParsed, newParsed);
        return (0, getChanged_1.getChanges)(mapped);
    }
}
exports.HtmlSafeString = HtmlSafeString;
function html(statics, ...dynamics) {
    return new HtmlSafeString(statics, dynamics);
}
exports.html = html;
