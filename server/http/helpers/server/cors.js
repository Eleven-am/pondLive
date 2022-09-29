"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorsMiddleware = void 0;
function CorsMiddleware() {
    return (_, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        next();
    };
}
exports.CorsMiddleware = CorsMiddleware;
