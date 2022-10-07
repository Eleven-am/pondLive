import {IncomingMessage, Server, ServerResponse} from "http";
import {BaseClass} from "../../pondbase";

export type NextFunction = () => void;
export type MiddleWareFunction = (request: IncomingMessage, response: ServerResponse, next: NextFunction) => void;

export type Chain = {
    use: (middleware: MiddleWareFunction) => void
}

export class MiddleWare extends BaseClass {
    private readonly _server: Server
    private readonly _stack: MiddleWareFunction[] = [];

    constructor(server: Server) {
        super();
        this._server = server;
        this._initMiddleware();
    }

    get stack() {
        return this._stack;
    }

    public use(middleware: MiddleWareFunction) {
        this._stack.push(middleware);
    }

    private _execute(req: IncomingMessage, res: ServerResponse) {
        const temp = this._stack.concat();
        const next = () => {
            const middleware = temp.shift();
            if (middleware)
                middleware(req, res, next);

            else {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('404 Not Found');
            }
        }
        next();
    }

    private _initMiddleware() {
        this._server.on('request', (req, res) => {
            this._execute(req, res);
        })
    }
}
