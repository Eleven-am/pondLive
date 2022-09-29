"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const componentManager_1 = require("./componentManager");
describe('ComponentManager', () => {
    it('should be an instance of ComponentManager', () => {
        const test = {
            pond: {},
            chain: {},
            parentId: 'test',
        };
        const context = {};
        const componentManager = new componentManager_1.ComponentManager('/test', context, test);
        expect(componentManager).toBeInstanceOf(componentManager_1.ComponentManager);
    });
    it('should');
});
