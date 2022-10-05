"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pondMouseEvents = void 0;
var eventEmmiter_1 = require("./eventEmmiter");
var pondClick = function (channel, watcher) {
    watcher.addEventListener('[pond-click]', 'click', function (element) {
        (0, eventEmmiter_1.dispatchEvent)(channel, element, 'pond-click');
    });
};
var pondMouseEnter = function (channel, watcher) {
    watcher.addEventListener('[pond-mouseenter]', 'mouseenter', function (element) {
        (0, eventEmmiter_1.dispatchEvent)(channel, element, 'pond-mouseenter');
    });
};
var pondMouseLeave = function (channel, watcher) {
    watcher.addEventListener('[pond-mouseleave]', 'mouseleave', function (element) {
        (0, eventEmmiter_1.dispatchEvent)(channel, element, 'pond-mouseleave');
    });
};
var pondMouseMove = function (channel, watcher) {
    watcher.addEventListener('[pond-mousemove]', 'mousemove', function (element) {
        (0, eventEmmiter_1.dispatchEvent)(channel, element, 'pond-mousemove');
    });
};
var pondMouseDown = function (channel, watcher) {
    watcher.addEventListener('[pond-mousedown]', 'mousedown', function (element) {
        (0, eventEmmiter_1.dispatchEvent)(channel, element, 'pond-mousedown');
    });
};
var pondMouseUp = function (channel, watcher) {
    watcher.addEventListener('[pond-mouseup]', 'mouseup', function (element) {
        (0, eventEmmiter_1.dispatchEvent)(channel, element, 'pond-mouseup');
    });
};
var pondDoubleClick = function (channel, watcher) {
    watcher.addEventListener('[pond-double-click]', 'dblclick', function (element) {
        (0, eventEmmiter_1.dispatchEvent)(channel, element, 'pond-double-click');
    });
};
var pondMouseEvents = function (channel, watcher) {
    pondClick(channel, watcher);
    pondMouseEnter(channel, watcher);
    pondMouseLeave(channel, watcher);
    pondMouseMove(channel, watcher);
    pondMouseDown(channel, watcher);
    pondMouseUp(channel, watcher);
    pondDoubleClick(channel, watcher);
};
exports.pondMouseEvents = pondMouseEvents;
