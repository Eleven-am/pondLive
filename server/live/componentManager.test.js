"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var componentManager_1 = require("./componentManager");
describe('ComponentManager', function () {
    it('should be an instance of ComponentManager', function () {
        var test = {
            pond: {},
            chain: {},
            parentId: 'test',
        };
        var context = {};
        var componentManager = new componentManager_1.ComponentManager('/test', context, test);
        expect(componentManager).toBeInstanceOf(componentManager_1.ComponentManager);
    });
});
