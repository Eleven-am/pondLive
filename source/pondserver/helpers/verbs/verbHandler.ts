import {MiddleWare, NextFunction} from "../middleWare";
import {IncomingMessage} from "http";
import {PondHTTPResponse} from "../server/pondHTTPResponse";
import { PondPath } from "../../../pondbase";

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export const VerbHandler = <T extends IncomingMessage>(chain: MiddleWare, path: PondPath, method: HTTPMethod, handler: (req: T, res: PondHTTPResponse, next: NextFunction) => void) => {
    chain.use((req, res, next) => {
        if (method === req.method) {
            const resolver = chain.generateEventRequest(path, req.url || '');
            if (resolver) {
                const newRes = new PondHTTPResponse(res);
                const newReq = {...req, ...resolver} as any as T;
                handler(newReq, newRes, next);
            } else
                next();
        } else
            next();
    })
}
