"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var liveSocket_1 = require("./liveSocket");
var createSocket = function () {
    var manager = {
        handleInfo: jest.fn(),
    };
    return new liveSocket_1.LiveSocket('123', manager, function () { });
};
describe('LiveSocket', function () {
    it('should be able to assign data to a context', function () {
        var socket = createSocket();
        expect(socket.context).toEqual({});
        socket.assign({ test: 'test' });
        expect(socket.context).toEqual({ test: 'test' });
    });
});
