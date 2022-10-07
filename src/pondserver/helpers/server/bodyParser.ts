import {MiddleWareFunction} from "../middleWare";
import {IncomingMessage} from "http";

export type BodyParserRequest = IncomingMessage & {
    body?: any
}

export function BodyParserMiddleware(): MiddleWareFunction {
    return (req: BodyParserRequest, _, next) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        })
        req.on('end', () => {
            req.body = body;
            next();
        })
    }
}

export function JsonBodyParserMiddleware(): MiddleWareFunction {
    return (req: BodyParserRequest, _, next) => {
        if (req.headers['content-type'] === 'application/json' && req.body) {
           try {
                req.body = JSON.parse(req.body);
           } finally {
               next();
           }
        }

        else
            next();
    }
}
