"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonBodyParserMiddleware = exports.BodyParserMiddleware = void 0;
function BodyParserMiddleware() {
    return (req, _, next) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            req.body = body;
            next();
        });
    };
}
exports.BodyParserMiddleware = BodyParserMiddleware;
function JsonBodyParserMiddleware() {
    return (req, _, next) => {
        if (req.headers['content-type'] === 'application/json' && req.body) {
            try {
                req.body = JSON.parse(req.body);
            }
            finally {
                next();
            }
        }
        else
            next();
    };
}
exports.JsonBodyParserMiddleware = JsonBodyParserMiddleware;
