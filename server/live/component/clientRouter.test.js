"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var clientRouter_1 = require("./clientRouter");
var http_1 = require("../../http");
describe('clientRouter', function () {
    it('should be a function', function () {
        expect(typeof clientRouter_1.clientRouter).toBe('function');
    });
    it('should return a function', function () {
        var value = (0, http_1.html)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["<h1>hello</h1>"], ["<h1>hello</h1>"])));
        var val = (0, http_1.html)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["<div id=\"test\" pond-router=\"test1\">", "</div>"], ["<div id=\"test\" pond-router=\"test1\">", "</div>"])), value);
        expect((0, clientRouter_1.clientRouter)('test', 'test1', value).toString()).toEqual(val.toString());
    });
});
var templateObject_1, templateObject_2;
