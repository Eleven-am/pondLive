"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveFactory = exports.ComponentClass = void 0;
class ComponentClass {
    constructor() {
        this.routes = [];
        this.providers = [];
    }
}
exports.ComponentClass = ComponentClass;
function LiveFactory(context) {
    return class LiveComponentClass extends ComponentClass {
        constructor() {
            super(...arguments);
            this.routes = context.routes || [];
            this.providers = context.providers || [];
            this.mount = context.mount;
            this.onContextChange = context.onContextChange;
            this.onRendered = context.onRendered;
            this.onEvent = context.onEvent;
            this.onInfo = context.onInfo;
            this.onUploadRequest = context.onUploadRequest;
            this.onUpload = context.onUpload;
            this.onUnmount = context.onUnmount;
            this.render = context.render;
            this.manageStyles = context.manageStyles;
        }
    };
}
exports.LiveFactory = LiveFactory;
