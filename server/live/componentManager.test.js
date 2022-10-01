"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const componentManager_1 = require("./componentManager");
const pondLiveChannel_1 = require("./pondLiveChannel");
const createComponentManager = () => {
    const test = {
        pond: {
            on: jest.fn(),
        },
        chain: {
            use: jest.fn(),
        },
        parentId: 'test',
        pondLive: new pondLiveChannel_1.PondLiveChannelManager(),
    };
    const context = {
        routes: [],
    };
    return new componentManager_1.ComponentManager('/test', context, test);
};
describe('ComponentManager', () => {
    it('should be an instance of ComponentManager', () => {
        const componentManager = createComponentManager();
        expect(componentManager).toBeInstanceOf(componentManager_1.ComponentManager);
    });
});
