"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonBodyParserMiddleware = exports.BodyParserMiddleware = void 0;
function BodyParserMiddleware() {
    return function (req, _, next) {
        var body = '';
        req.on('data', function (chunk) {
            body += chunk.toString();
        });
        req.on('end', function () {
            req.body = body;
            next();
        });
    };
}
exports.BodyParserMiddleware = BodyParserMiddleware;
function JsonBodyParserMiddleware() {
    return function (req, _, next) {
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
