"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var liveSocket_1 = require("./liveSocket");
var pondChannel_1 = require("../../socket/pondChannel");
describe('LiveSocket', function () {
    it('should be able to assign data to a context', function () {
        var pondChannel = new pondChannel_1.PondChannel('/test', function () { });
        var manager = {};
        var socket = new liveSocket_1.LiveSocket('123', pondChannel, manager);
        expect(socket.context).toEqual({});
        socket.assign({ test: 'test' });
        expect(socket.context).toEqual({ test: 'test' });
    });
    it('should be able to subscribe to a channel', function () {
        var pondChannel = new pondChannel_1.PondChannel('/test', function () { });
        var manager = {};
        var socket = new liveSocket_1.LiveSocket('123', pondChannel, manager);
        socket.subscribe('/pond');
        // The default behavior of the pond channel is to create a new channel when a client subscribes to it.
        expect(pondChannel.getChannelInfo('/pond')).toEqual({
            name: '/pond',
            channelData: {},
            presence: [],
            assigns: {}
        });
        expect(pondChannel.info).toHaveLength(1);
    });
    it('should be able to able to accept a channel', function () {
        var pondChannel = new pondChannel_1.PondChannel('/test', function () { });
        var mock = jest.fn();
        var manager = {
            handleInfo: jest.fn()
        };
        var socket = new liveSocket_1.LiveSocket('123', pondChannel, manager);
        socket.subscribe('/pond');
        var chan = pondChannel.findChannel(function (c) { return c.name === '/pond'; });
        expect(chan).not.toBeNull();
        // Whe the socket receives a message it should call the channel's createPondResponse method
        socket.channel = {
            createPondResponse: mock,
            info: {
                assigns: {
                    '123': {}
                }
            }
        };
        // if we broadcast through chan or the socket it should attempt to generate a response
        // When the response is generated it should call the manager's handleInfo method as well
        chan === null || chan === void 0 ? void 0 : chan.broadcast('test', { test: 'test' });
        socket.broadcast('/pond', 'test', { test: 'test' });
        // Although 2 broadcasts were made, the manager's handleInfo method should only be called once
        // this is because the socket broadcasts to the with the identifier of the client which is thus ignored
        expect(mock).toHaveBeenCalledTimes(1);
        expect(manager.handleInfo).toHaveBeenCalledTimes(1);
    });
    it('should be able to assign data to a channel', function () {
        var pondChannel = new pondChannel_1.PondChannel('/test', function () { });
        var manager = {};
        var socket = new liveSocket_1.LiveSocket('123', pondChannel, manager);
        socket.subscribe('/pond'); // Subscribe to the pond channel to create a new channel
        var chan = pondChannel.findChannel(function (c) { return c.name === '/pond'; });
        expect(chan).not.toBeNull();
        socket.assignToChannel('/pond', { test: 'test' });
        expect(chan === null || chan === void 0 ? void 0 : chan.data).toEqual({ test: 'test' });
    });
    it('should be able to get data from a channel', function () {
        var pondChannel = new pondChannel_1.PondChannel('/test', function () { });
        var manager = {};
        var socket = new liveSocket_1.LiveSocket('123', pondChannel, manager);
        socket.subscribe('/pond'); // Subscribe to the pond channel to create a new channel
        var chan = pondChannel.findChannel(function (c) { return c.name === '/pond'; });
        expect(chan).not.toBeNull();
        socket.assignToChannel('/pond', { test: 'test' });
        expect(socket.getChannelData('/pond')).toEqual({ test: 'test' });
        // If the channel does not exist it should return null
        expect(socket.getChannelData('/test')).toBeNull();
    });
    it('should be able to unsubscribe from a channel', function () {
        var pondChannel = new pondChannel_1.PondChannel('/test', function () { });
        var manager = {};
        var socket = new liveSocket_1.LiveSocket('123', pondChannel, manager);
        socket.subscribe('/pond'); // Subscribe to the pond channel to create a new channel
        var chan = pondChannel.findChannel(function (c) { return c.name === '/pond'; });
        expect(socket['_subscriptions']).toHaveLength(1);
        expect(chan).not.toBeNull();
        socket.unsubscribe('/pond');
        expect(pondChannel.info).toHaveLength(1); // unfortunately the pond channel is not removed from the pond channel when we unsubscribe
        // however the socket is no longer subscribed to the channel
        expect(socket['_subscriptions']).toHaveLength(0);
    });
});
