"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var componentManager_1 = require("./componentManager");
var createComponentManager = function () {
    var test = {
        pond: {
            on: jest.fn(),
        },
        chain: {
            use: jest.fn(),
        },
        parentId: 'test',
        secret: 'test',
        providers: [],
    };
    var context = {
        routes: [],
    };
    return new componentManager_1.ComponentManager('/test', context, test);
};
describe('ComponentManager', function () {
    it('should be an instance of ComponentManager', function () {
        var componentManager = createComponentManager();
        expect(componentManager).toBeInstanceOf(componentManager_1.ComponentManager);
    });
});
