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
exports.LiveFactory = exports.ComponentClass = void 0;
var ComponentClass = /** @class */ (function () {
    function ComponentClass() {
        this.routes = [];
        this.providers = [];
    }
    return ComponentClass;
}());
exports.ComponentClass = ComponentClass;
function LiveFactory(props) {
    return /** @class */ (function (_super) {
        __extends(Impl, _super);
        function Impl() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.routes = props.routes || [];
            _this.providers = props.providers || [];
            _this.mount = props.mount;
            _this.onContextChange = props.onContextChange;
            _this.onRendered = props.onRendered;
            _this.onEvent = props.onEvent;
            _this.onInfo = props.onInfo;
            _this.onUnmount = props.onUnmount;
            _this.render = props.render;
            _this.manageStyles = props.manageStyles;
            return _this;
        }
        return Impl;
    }(ComponentClass));
}
exports.LiveFactory = LiveFactory;
