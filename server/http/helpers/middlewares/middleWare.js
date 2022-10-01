"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddleWare = void 0;
const utils_1 = require("../../../utils");
class MiddleWare extends utils_1.BaseClass {
    _server;
    _stack = [];
    constructor(server) {
        super();
        this._server = server;
        this._initMiddleware();
    }
    get stack() {
        return this._stack;
    }
    use(middleware) {
        this._stack.push(middleware);
    }
    _execute(req, res) {
        const temp = this._stack.concat();
        const next = () => {
            const middleware = temp.shift();
            if (middleware)
                middleware(req, res, next);
            else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            }
        };
        next();
    }
    _initMiddleware() {
        this._server.on('request', (req, res) => {
            this._execute(req, res);
        });
    }
}
exports.MiddleWare = MiddleWare;
