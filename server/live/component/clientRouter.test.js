"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clientRouter_1 = require("./clientRouter");
const http_1 = require("../../http");
describe('clientRouter', () => {
    it('should be a function', () => {
        expect(typeof clientRouter_1.clientRouter).toBe('function');
    });
    it('should return a function', () => {
        const value = (0, http_1.html) `<h1>hello</h1>`;
        const val = (0, http_1.html) `<div id="test" pond-router="test1">${value}</div>`;
        expect((0, clientRouter_1.clientRouter)('test', 'test1', value).toString()).toEqual(val.toString());
    });
});
