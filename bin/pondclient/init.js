"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
var socket_1 = require("./socket");
var informer_1 = require("./informer");
var domWatcher_1 = require("./domWatcher");
var pondMouseEvents_1 = require("./pondMouseEvents");
var history_1 = require("./history");
var pondKeyboardEvents_1 = require("./pondKeyboardEvents");
var pondFormEvents_1 = require("./pondFormEvents");
var eventEmmiter_1 = require("./eventEmmiter");
var init = function () {
    var socket = new socket_1.PondClientSocket('/live');
    socket.connect();
    var watcher = new domWatcher_1.DomWatcher();
    var channel = socket.createChannel("/live/".concat(window.token), { clientId: window.token });
    channel.join();
    var emitted = false;
    channel.onConnectionChange(function (state) {
        if (state) {
            (0, informer_1.informer)(channel, watcher);
            (0, pondMouseEvents_1.pondMouseEvents)(channel, watcher);
            (0, pondKeyboardEvents_1.pondKeyboardEvents)(channel, watcher);
            (0, pondFormEvents_1.pondFormInit)(channel, watcher);
            (0, history_1.router)(watcher);
            (0, informer_1.manageRoutes)(channel);
            if (!emitted) {
                emitted = true;
                (0, eventEmmiter_1.emitEvent)('pondReady', channel);
            }
        }
    });
};
exports.init = init;
