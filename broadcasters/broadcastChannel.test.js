"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChannel = exports.createSocket = void 0;
const broadcastChannel_1 = require("./broadcastChannel");
const emitters_1 = require("../emitters");
const pondsocket_1 = require("@eleven-am/pondsocket");
const createSocket = (clientId = '123') => {
    const manager = {
        manageSocketRender: jest.fn(),
    };
    const removeDoc = jest.fn();
    const socket = new emitters_1.LiveSocket(clientId, manager, removeDoc);
    return { socket, manager, removeDoc };
};
exports.createSocket = createSocket;
const createChannel = () => {
    const removeDoc = jest.fn();
    // @ts-ignore
    const channel = new pondsocket_1.Channel('TEST', { _handlers: [] }, removeDoc);
    return { channel, removeDoc };
};
exports.createChannel = createChannel;
describe('Broadcaster', () => {
    it('should create a new broadcaster', () => {
        const broadcaster = new broadcastChannel_1.BroadcastChannel({});
        expect(broadcaster).toBeDefined();
    });
    it('should be able to assign data to the channel', () => {
        const broadcaster = new broadcastChannel_1.BroadcastChannel({});
        broadcaster.assign({ test: 1 });
        expect(broadcaster.channelData).toEqual({ test: 1 });
        broadcaster.assign({ test: 2 });
        expect(broadcaster.channelData).toEqual({ test: 2 });
    });
    it('should be able to add a client', () => {
        const { socket } = (0, exports.createSocket)();
        const { channel } = (0, exports.createChannel)();
        jest.useFakeTimers();
        socket.upgradeToWebsocket(channel);
        const broadcaster = new broadcastChannel_1.BroadcastChannel({});
        expect(broadcaster['_database'].size).toBe(0);
        // When a socket subscribes to a broadcast channel, if any event is emitted
        // it will be sent to the socket.
        // Assigning data to the channel will not emit an event to the socket.
        // The data can be used for computation on the server side.
        broadcaster.subscribe(socket);
        // Since the socket is subscribed to the channel, it will be added to the database
        expect(broadcaster['_database'].size).toBe(1);
        // When a socket is downgraded, it will be removed from the database
        socket.destroy();
        jest.runAllTimers();
        expect(broadcaster['_database'].size).toBe(0);
        // When a socket is destroyed, it will be removed from the database
        broadcaster.subscribe(socket);
        expect(broadcaster['_database'].size).toBe(1);
        socket.destroy();
        jest.runAllTimers();
        expect(broadcaster['_database'].size).toBe(0);
    });
    it('should be able to emit an event to all clients', () => {
        const { socket, manager } = (0, exports.createSocket)();
        const { channel } = (0, exports.createChannel)();
        socket.upgradeToWebsocket(channel);
        const broadcaster = new broadcastChannel_1.BroadcastChannel({});
        broadcaster.subscribe(socket);
        // When a broadcaster emits an event, it will be sent to all sockets
        // The subscriber will call the handleInfo method on the manager
        // usually triggers the onInfo method on the component, this cannot be tested as the class is an abstract class
        broadcaster.broadcast({ event: 'test', payload: { test: 'test' } });
        expect(manager.manageSocketRender).toHaveBeenCalled();
    });
    it('should be able to exclude the emitter from the broadcast', () => {
        const { socket, manager } = (0, exports.createSocket)();
        const { channel } = (0, exports.createChannel)();
        socket.upgradeToWebsocket(channel);
        const broadcaster = new broadcastChannel_1.BroadcastChannel({});
        broadcaster.subscribe(socket);
        const { socket: socket2, manager: manager2 } = (0, exports.createSocket)('456');
        const { channel: channel2 } = (0, exports.createChannel)();
        socket2.upgradeToWebsocket(channel2);
        broadcaster.subscribe(socket2);
        expect(broadcaster['_database'].size).toBe(2);
        broadcaster.broadcastFrom(socket, { event: 'test', payload: { test: 'test' } });
        expect(manager.manageSocketRender).not.toHaveBeenCalled();
        expect(manager2.manageSocketRender).toHaveBeenCalled();
    });
    it('should not duplicate a client', () => {
        const { socket, manager } = (0, exports.createSocket)();
        const { channel } = (0, exports.createChannel)();
        socket.upgradeToWebsocket(channel);
        const broadcaster = new broadcastChannel_1.BroadcastChannel({});
        broadcaster.subscribe(socket);
        expect(broadcaster['_database'].size).toBe(1);
        // because the socket has already been added to the database, it will not be added again
        broadcaster.subscribe(socket);
        expect(broadcaster['_database'].size).toBe(1);
        broadcaster.broadcast({ event: 'test', payload: { test: 'test' } });
        expect(manager.manageSocketRender).toHaveBeenCalled();
        // This is currently a limitation of the broadcaster, if a socket is destroyed
        // It is thus advised to use a larger scoped socket to subscribe and use contexts to distribute the data
    });
    it('should only handle events that it emits', () => {
        const broadcaster = new broadcastChannel_1.BroadcastChannel({});
        const broadcaster2 = new broadcastChannel_1.BroadcastChannel({});
        const mockInfo = jest.fn();
        const mockInfo2 = jest.fn();
        const manager = {
            manageSocketRender: (_a, b, _c, cb) => {
                cb({
                    onInfo: (data) => {
                        broadcaster.handleEvent(data, mockInfo);
                        broadcaster2.handleEvent(data, mockInfo2);
                    }
                }, b);
            }
        };
        const removeDoc = jest.fn();
        const socket = new emitters_1.LiveSocket('123', manager, removeDoc);
        const { channel } = (0, exports.createChannel)();
        socket.upgradeToWebsocket(channel);
        broadcaster.subscribe(socket);
        broadcaster2.subscribe(socket);
        broadcaster.broadcast({ event: 'test', payload: { test: 'test' } });
        expect(mockInfo).toHaveBeenCalled();
        expect(mockInfo2).not.toHaveBeenCalled();
        mockInfo.mockClear();
        broadcaster2.broadcast({ event: 'test', payload: { test: 'test' } });
        expect(mockInfo).not.toHaveBeenCalled();
        expect(mockInfo2).toHaveBeenCalled();
    });
});
