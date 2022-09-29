"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const liveSocket_1 = require("./liveSocket");
const pondChannel_1 = require("../../socket/pondChannel");
describe('LiveSocket', () => {
    it('should be able to assign data to a context', () => {
        const pondChannel = new pondChannel_1.PondChannel('/test', () => { });
        const manager = {};
        const socket = new liveSocket_1.LiveSocket('123', pondChannel, manager);
        expect(socket.context).toEqual({});
        socket.assign({ test: 'test' });
        expect(socket.context).toEqual({ test: 'test' });
    });
    it('should be able to subscribe to a channel', () => {
        const pondChannel = new pondChannel_1.PondChannel('/test', () => { });
        const manager = {};
        const socket = new liveSocket_1.LiveSocket('123', pondChannel, manager);
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
    it('should be able to able to accept a channel', () => {
        const pondChannel = new pondChannel_1.PondChannel('/test', () => { });
        const mock = jest.fn();
        const manager = {
            handleInfo: jest.fn()
        };
        const socket = new liveSocket_1.LiveSocket('123', pondChannel, manager);
        socket.subscribe('/pond');
        const chan = pondChannel.findChannel(c => c.name === '/pond');
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
        chan?.broadcast('test', { test: 'test' });
        socket.broadcast('/pond', 'test', { test: 'test' });
        // Although 2 broadcasts were made, the manager's handleInfo method should only be called once
        // this is because the socket broadcasts to the with the identifier of the client which is thus ignored
        expect(mock).toHaveBeenCalledTimes(1);
        expect(manager.handleInfo).toHaveBeenCalledTimes(1);
    });
    it('should be able to assign data to a channel', () => {
        const pondChannel = new pondChannel_1.PondChannel('/test', () => { });
        const manager = {};
        const socket = new liveSocket_1.LiveSocket('123', pondChannel, manager);
        socket.subscribe('/pond'); // Subscribe to the pond channel to create a new channel
        const chan = pondChannel.findChannel(c => c.name === '/pond');
        expect(chan).not.toBeNull();
        socket.assignToChannel('/pond', { test: 'test' });
        expect(chan?.data).toEqual({ test: 'test' });
    });
    it('should be able to get data from a channel', () => {
        const pondChannel = new pondChannel_1.PondChannel('/test', () => { });
        const manager = {};
        const socket = new liveSocket_1.LiveSocket('123', pondChannel, manager);
        socket.subscribe('/pond'); // Subscribe to the pond channel to create a new channel
        const chan = pondChannel.findChannel(c => c.name === '/pond');
        expect(chan).not.toBeNull();
        socket.assignToChannel('/pond', { test: 'test' });
        expect(socket.getChannelData('/pond')).toEqual({ test: 'test' });
        // If the channel does not exist it should return null
        expect(socket.getChannelData('/test')).toBeNull();
    });
    it('should be able to unsubscribe from a channel', () => {
        const pondChannel = new pondChannel_1.PondChannel('/test', () => { });
        const manager = {};
        const socket = new liveSocket_1.LiveSocket('123', pondChannel, manager);
        socket.subscribe('/pond'); // Subscribe to the pond channel to create a new channel
        const chan = pondChannel.findChannel(c => c.name === '/pond');
        expect(socket['_subscriptions']).toHaveLength(1);
        expect(chan).not.toBeNull();
        socket.unsubscribe('/pond');
        expect(pondChannel.info).toHaveLength(1); // unfortunately the pond channel is not removed from the pond channel when we unsubscribe
        // however the socket is no longer subscribed to the channel
        expect(socket['_subscriptions']).toHaveLength(0);
    });
});
