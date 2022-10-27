"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contextManager_1 = require("./contextManager");
/*const createChannel = () => {
    const removeDoc = jest.fn()
    const channel = new Channel('TEST', removeDoc);

    return {channel, removeDoc}
}*/
describe('ContextManager', () => {
    it('should create a new context', () => {
        const contextManager = new contextManager_1.ContextDistributor({});
        expect(contextManager).toBeDefined();
    });
});
