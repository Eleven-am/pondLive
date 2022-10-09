"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveFactory = void 0;
function LiveFactory(props) {
    return /** @class */ (function () {
        function LiveComponentImpl() {
            this.routes = props.routes || [];
            this.providers = props.providers || [];
            this.mount = props.mount;
            this.onRendered = props.onRendered;
            this.onEvent = props.onEvent;
            this.onContextChange = props.onContextChange;
            this.onInfo = props.onInfo;
            this.onUnmount = props.onUnmount;
            this.render = props.render;
            this.manageStyles = props.manageStyles;
        }
        return LiveComponentImpl;
    }());
}
exports.LiveFactory = LiveFactory;
