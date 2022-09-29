"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientRouter = void 0;
const parser_1 = require("../../http/helpers/parser/parser");
const clientRouter = (parentId, componentId, innerRoute) => {
    return (0, parser_1.html) `<div id="${parentId}" pond-router="${componentId}">${innerRoute}</div>`;
};
exports.clientRouter = clientRouter;
