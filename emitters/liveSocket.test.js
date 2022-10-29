"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const broadcastChannel_test_1 = require("../broadcasters/broadcastChannel.test");
describe('LiveSocket', () => {
    it('should be able to assign data to a context', () => {
        const { socket } = (0, broadcastChannel_test_1.createSocket)();
        expect(socket.context).toEqual({});
        socket.assign({ test: 'test' });
        expect(socket.context).toEqual({ test: 'test' });
    });
    it('should destroy socket', () => {
        const { socket, removeDoc } = (0, broadcastChannel_test_1.createSocket)();
        jest.useFakeTimers();
        socket.destroy(); // this will remove the socket from the database
        jest.runAllTimers();
        expect(removeDoc).toHaveBeenCalled();
    });
    it('should handle info upgrade to websocket', () => {
        const { socket } = (0, broadcastChannel_test_1.createSocket)();
        const { channel } = (0, broadcastChannel_test_1.createChannel)();
        expect(socket.isWebsocket).toBe(false);
        socket.upgradeToWebsocket(channel);
        expect(socket.isWebsocket).toBe(true);
    });
    it('should call the managers handle context change when it receives a message', () => __awaiter(void 0, void 0, void 0, function* () {
        const { socket, manager } = (0, broadcastChannel_test_1.createSocket)();
        const { channel } = (0, broadcastChannel_test_1.createChannel)();
        socket.upgradeToWebsocket(channel);
        // The broadcaster hooks on to the channel and calls the onMessage method
        yield socket.onMessage({ event: 'test', payload: { test: 'test' } });
        expect(manager.manageSocketRender).toHaveBeenCalled();
    }));
    it('should create a response', () => {
        const { socket } = (0, broadcastChannel_test_1.createSocket)();
        // The createResponse method requires the livesocket to be a websocket
        expect(() => socket.createResponse()).toThrow();
        // This is because the createResponse method creates a pond response
        // This response needs to be able to communicate with the client via the websocket
        // We thus upgrade the socket to a websocket before calling createResponse
        const { channel } = (0, broadcastChannel_test_1.createChannel)();
        socket.upgradeToWebsocket(channel);
        expect(() => socket.createResponse()).not.toThrow();
        const { response, router } = socket.createResponse();
        expect(response).toBeDefined();
        expect(router).toBeDefined();
    });
    it('should emit an event', () => {
        const { socket } = (0, broadcastChannel_test_1.createSocket)();
        const { channel } = (0, broadcastChannel_test_1.createChannel)();
        // the emit function is only available on a websocket
        // it broadcasts the event to the client
        channel.onMessage(data => {
            expect(data.event).toEqual('emit');
            expect(data.message).toEqual({ event: 'test', data: { test: 'test' } });
        });
        socket.upgradeToWebsocket(channel);
        socket.emit('test', { test: 'test' });
    });
});
