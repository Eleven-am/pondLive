"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRouter = void 0;
var path_1 = __importDefault(require("path"));
var fs = __importStar(require("fs"));
var getContentType = function (extension) {
    switch (extension) {
        case '.html':
            return 'text/html';
        case '.js':
            return 'text/javascript';
        case '.css':
            return 'text/css';
        case '.json':
            return 'application/json';
        case '.png':
            return 'image/png';
        case '.jpg':
            return 'image/jpg';
        case '.wav':
            return 'audio/wav';
        default:
            return 'text/plain';
    }
};
// check if file exist and is not a directory
var fileExist = function (filePath) {
    try {
        return fs.existsSync(filePath) && !fs.lstatSync(filePath).isDirectory();
    }
    catch (err) {
        return false;
    }
};
var FileRouter = function (absolutePath) { return function (request, response, next) {
    var _a, _b;
    if (request.method !== "GET")
        return next();
    var modifiedUrl = (_b = (_a = request.url) === null || _a === void 0 ? void 0 : _a.replace(/%20/g, " ")) !== null && _b !== void 0 ? _b : "";
    var filePath = path_1.default.join(absolutePath, modifiedUrl);
    if (!fileExist(filePath))
        return next();
    var extension = path_1.default.extname(modifiedUrl);
    var contentType = getContentType(extension);
    fs.readFile(filePath, function (error, content) {
        if (error) {
            response.writeHead(500);
            response.end();
        }
        else {
            if (contentType.startsWith('image')) {
                response.writeHead(200, { 'Content-Type': contentType });
                response.end(content, 'binary');
            }
            else {
                response.writeHead(200, { 'Content-Type': contentType });
                response.end(content, 'utf-8');
            }
        }
    });
}; };
exports.FileRouter = FileRouter;
