"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pondFormInit = void 0;
var pondFocus = function (channel, watcher) {
    watcher.addEventListener('[pond-focus]', 'focus', function (element) {
        var closestRouter = element.closest('[pond-router]');
        if (closestRouter) {
            var path = closestRouter.getAttribute('pond-router');
            var event_1 = element.getAttribute('pond-focus');
            if (path && event_1)
                channel.broadcastFrom("event/".concat(path), { type: event_1 });
        }
    });
};
var pondBlur = function (channel, watcher) {
    watcher.addEventListener('[pond-blur]', 'blur', function (element) {
        var closestRouter = element.closest('[pond-router]');
        if (closestRouter) {
            var path = closestRouter.getAttribute('pond-router');
            var event_2 = element.getAttribute('pond-blur');
            if (path && event_2)
                channel.broadcastFrom("event/".concat(path), { type: event_2 });
        }
    });
};
var pondChange = function (channel, watcher) {
    watcher.addEventListener('[pond-change]', 'change', function (element) {
        var closestRouter = element.closest('[pond-router]');
        if (closestRouter) {
            var path = closestRouter.getAttribute('pond-router');
            var event_3 = element.getAttribute('pond-change');
            if (path && event_3)
                channel.broadcastFrom("event/".concat(path), { type: event_3 });
        }
    });
};
var pondInput = function (channel, watcher) {
    watcher.addEventListener('[pond-input]', 'input', function (element) {
        var closestRouter = element.closest('[pond-router]');
        if (closestRouter) {
            var path = closestRouter.getAttribute('pond-router');
            var event_4 = element.getAttribute('pond-input');
            if (path && event_4)
                channel.broadcastFrom("event/".concat(path), { type: event_4 });
        }
    });
};
var pondSubmit = function (channel, watcher) {
    watcher.addEventListener('[pond-submit]', 'submit', function (element) {
        var closestRouter = element.closest('[pond-router]');
        if (closestRouter) {
            var path = closestRouter.getAttribute('pond-router');
            var event_5 = element.getAttribute('pond-submit');
            if (path && event_5)
                channel.broadcastFrom("event/".concat(path), { type: event_5 });
        }
    });
};
var pondFormInit = function (channel, watcher) {
    pondFocus(channel, watcher);
    pondBlur(channel, watcher);
    pondChange(channel, watcher);
    pondInput(channel, watcher);
    pondSubmit(channel, watcher);
};
exports.pondFormInit = pondFormInit;
