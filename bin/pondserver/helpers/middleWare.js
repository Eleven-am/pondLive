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
exports.MiddleWare = void 0;
var pondbase_1 = require("../../pondbase");
var MiddleWare = /** @class */ (function (_super) {
    __extends(MiddleWare, _super);
    function MiddleWare(server) {
        var _this = _super.call(this) || this;
        _this._stack = [];
        _this._server = server;
        _this._initMiddleware();
        return _this;
    }
    Object.defineProperty(MiddleWare.prototype, "stack", {
        get: function () {
            return this._stack;
        },
        enumerable: false,
        configurable: true
    });
    MiddleWare.prototype.use = function (middleware) {
        this._stack.push(middleware);
    };
    MiddleWare.prototype._execute = function (req, res) {
        var temp = this._stack.concat();
        var next = function () {
            var middleware = temp.shift();
            if (middleware)
                middleware(req, res, next);
            else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            }
        };
        next();
    };
    MiddleWare.prototype._initMiddleware = function () {
        var _this = this;
        this._server.on('request', function (req, res) {
            _this._execute(req, res);
        });
    };
    return MiddleWare;
}(pondbase_1.BaseClass));
exports.MiddleWare = MiddleWare;
