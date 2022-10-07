"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientRouter = void 0;
var pondserver_1 = require("../../pondserver");
var clientRouter = function (parentId, componentId, innerRoute) {
    return (0, pondserver_1.html)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["<div id=\"", "\" pond-router=\"", "\">", "</div>"], ["<div id=\"", "\" pond-router=\"", "\">", "</div>"])), parentId, componentId, innerRoute);
};
exports.clientRouter = clientRouter;
var templateObject_1;
