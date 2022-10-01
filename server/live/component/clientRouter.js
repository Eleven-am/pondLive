"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientRouter = void 0;
const http_1 = require("../../http");
const clientRouter = (parentId, componentId, innerRoute) => {
    return (0, http_1.html) `<div id="${parentId}" pond-router="${componentId}">${innerRoute}</div>`;
};
exports.clientRouter = clientRouter;
