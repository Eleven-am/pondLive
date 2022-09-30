"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveFactory = void 0;
function LiveFactory(props) {
    return class LiveComponentImpl {
        routes = props.routes;
        mount = props.mount;
        onRendered = props.onRendered;
        onEvent = props.onEvent;
        onInfo = props.onInfo;
        onUnmount = props.onUnmount;
        render = props.render;
        manageStyles = props.manageStyles;
    };
}
exports.LiveFactory = LiveFactory;
