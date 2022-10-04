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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerbHandler = void 0;
var pondHTTPResponse_1 = require("../helpers/server/pondHTTPResponse");
var VerbHandler = function (chain, path, method, handler) {
    chain.use(function (req, res, next) {
        if (method === req.method) {
            var resolver = chain.generateEventRequest(path, req.url || '');
            if (resolver) {
                var newRes = new pondHTTPResponse_1.PondHTTPResponse(res);
                var newReq = __assign(__assign({}, req), resolver);
                handler(newReq, newRes, next);
            }
            else
                next();
        }
        else
            next();
    });
};
exports.VerbHandler = VerbHandler;
