"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Broadcast = void 0;
var Broadcast = /** @class */ (function () {
    function Broadcast() {
        this._subscribers = new Set();
    }
    /**
     * @desc Subscribe to the broadcast
     * @param handler - The handler to call when the broadcast is published
     */
    Broadcast.prototype.subscribe = function (handler) {
        var _this = this;
        this._subscribers.add(handler);
        return {
            /**
             * @desc Unsubscribe from the broadcast
             */
            unsubscribe: function () {
                _this._subscribers.delete(handler);
            }
        };
    };
    /**
     * @desc Publish to the broadcast
     * @param data - The data to publish
     */
    Broadcast.prototype.publish = function (data) {
        var e_1, _a;
        var result;
        try {
            for (var _b = __values(this._subscribers), _c = _b.next(); !_c.done; _c = _b.next()) {
                var subscriber = _c.value;
                result = subscriber(data);
                if (result)
                    break;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return result;
    };
    return Broadcast;
}());
exports.Broadcast = Broadcast;
