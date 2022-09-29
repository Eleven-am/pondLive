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
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const getContentType = (extension) => {
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
const modifyUrl = (url) => {
    if (url === '/') {
        return '/index.html';
    }
    return url || '';
};
const FileRouter = (absolutePath) => (request, response, next) => {
    if (request.method !== "GET")
        return next();
    const modifiedUrl = modifyUrl(request.url);
    const filePath = path_1.default.join(absolutePath, modifiedUrl);
    if (!fs.existsSync(filePath))
        return next();
    const extension = path_1.default.extname(modifiedUrl);
    const contentType = getContentType(extension);
    fs.readFile(filePath, (error, content) => {
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
};
exports.FileRouter = FileRouter;
