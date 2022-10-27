"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.html = exports.HtmlSafeString = exports.join = void 0;
const deepDiff_1 = require("./deepDiff");
const getChanged_1 = require("./getChanged");
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
function escapeHTML(unsafe) {
    if (unsafe === undefined || unsafe === null) {
        return '';
    }
    if (unsafe instanceof HtmlSafeString) {
        return unsafe.toString();
    }
    if (Array.isArray(unsafe)) {
        return join(unsafe, '').toString();
    }
    return String(unsafe).replace(ENT_REGEX, (char) => ENTITIES[char]);
}
class HtmlSafeString {
    constructor(statics, dynamics) {
        this.statics = statics;
        this.dynamics = dynamics;
    }
    toString() {
        let result = this.statics[0];
        for (let i = 0; i < this.dynamics.length; i++) {
            if (this.dynamics[i] instanceof HtmlSafeString)
                result += this.dynamics[i].toString() + this.statics[i + 1];
            else if (Array.isArray(this.dynamics[i]))
                result += join(this.dynamics[i], '').toString() + this.statics[i + 1];
            else if (typeof this.dynamics[i] === 'object')
                result += this.parsedHtmlToString(this.dynamics[i]) + this.statics[i + 1];
            else
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
            else if (this.dynamics[i] === undefined)
                result[i] = null;
            else
                result[i] = this.dynamics[i];
        return result;
    }
    parsedHtmlToString(parsed) {
        var _a;
        const data = parsed;
        let result = '';
        if (Array.isArray(data))
            return join(data, '').toString();
        if (((_a = data === null || data === void 0 ? void 0 : data.s) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            const stat = data.s.filter(s => s !== undefined && s !== null);
            result = data.s[0];
            for (let i = 0; i < stat.length - 1; i++) {
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
    reconstruct(changes) {
        const data = (0, getChanged_1.mergeObjects)(this.getParts(), changes);
        return this.parse(data);
    }
    parse(parts) {
        const data = parts;
        const statics = data.s || [""];
        delete data.s;
        const dynamics = Object.values(data).filter(d => d !== undefined && d !== null);
        return new HtmlSafeString(statics, dynamics);
    }
}
exports.HtmlSafeString = HtmlSafeString;
function html(statics, ...dynamics) {
    return new HtmlSafeString(statics, dynamics);
}
exports.html = html;
