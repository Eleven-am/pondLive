"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const componentManager_1 = require("./componentManager");
const base_1 = require("@eleven-am/pondsocket/base");
const createComponentManager = () => {
    const test = {
        pond: {
            on: jest.fn(),
        },
        chain: {
            use: jest.fn(),
        },
        parentId: 'test',
        secret: 'test',
        uploadPath: 'test',
        internalBus: new base_1.Broadcast(),
        providers: [],
    };
    const context = {
        routes: [],
        providers: [],
    };
    return new componentManager_1.ComponentManager('/test', context, test);
};
describe('ComponentManager', () => {
    it('should be an instance of ComponentManager', () => {
        const componentManager = createComponentManager();
        expect(componentManager).toBeInstanceOf(componentManager_1.ComponentManager);
    });
});
