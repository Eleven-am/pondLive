"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchEvent = exports.emitEvent = void 0;
var emitEvent = function (event, data, element) {
    var eventEmitter = new CustomEvent(event, {
        detail: data,
        bubbles: true,
        cancelable: true,
    });
    if (element)
        element.dispatchEvent(eventEmitter);
    else
        window.dispatchEvent(eventEmitter);
};
exports.emitEvent = emitEvent;
var dispatchEvent = function (channel, element, listener, event) {
    var closestRouter = element.closest('[pond-router]');
    var value = null;
    if (event) {
        var input = event.target;
        value = input.value;
    }
    if (closestRouter) {
        var path = closestRouter.getAttribute('pond-router');
        var type = element.getAttribute(listener);
        var dataId = element.getAttribute('pond-data-id');
        if (path && type)
            channel.broadcastFrom("event/".concat(path), { type: type, value: value, dataId: dataId });
    }
};
exports.dispatchEvent = dispatchEvent;
