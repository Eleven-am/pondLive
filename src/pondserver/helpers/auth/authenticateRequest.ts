import {IncomingMessage, ServerResponse} from "http";
import {BaseClass} from "../../../pondbase";
import {deleteCookie, parseCookies, setCookie} from "./cookieHandler";
import internal from "stream";
import {NextFunction} from "../middleWare";

export type AuthenticatedRequest = IncomingMessage & {
    clientId?: string;
    token?: string;
}

type IAuthenticateRequest = (secret: string, cookie: string) => (req: AuthenticatedRequest, res: ServerResponse, next: NextFunction) => void;
type IAuthSocketRequest = (secret: string, cookie: string) => (req: AuthenticatedRequest, socket: internal.Duplex, head: Buffer, next: NextFunction) => void;

export const AuthenticateRequest: IAuthenticateRequest = (secret, cookie) => (req, res, next) => {
    const base = new BaseClass();
    let token = parseCookies(req.headers)[cookie] || '';
    let clientId = base.decrypt<{time: string}>(secret, token)?.time || null;

    if (!clientId) {
        if (token) {
            deleteCookie(res, cookie);
            res.writeHead(401, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify({message: 'Unauthorized'}));
        }

        clientId = Date.now().toString();

        token = base.encrypt(secret, {time: clientId});
        setCookie(res, cookie, token, {
            "max-age": 60 * 60 * 2,
        });

        req.clientId = clientId;
        req.token = token;
        next();

    } else {
        if (Date.now() - parseInt(clientId) > 1000 * 60 * 60 * 2) {
            deleteCookie(res, cookie);
            res.writeHead(401, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify({message: 'Unauthorized'}));
        }

        req.clientId = clientId;
        req.token = token;
        next();
    }
}

export const AuthenticateUpgrade: IAuthSocketRequest = (secret, cookie) => (req, socket, _, next) => {
    const base = new BaseClass();
    let token = parseCookies(req.headers)[cookie] || '';
    let clientId = base.decrypt<{time: string}>(secret, token)?.time || null;

    if (!clientId || clientId && Date.now() - parseInt(clientId) > 1000 * 60 * 60 * 2) {
        socket.write('HTTP/1.1 401 Unauthorized\r');
        socket.write('Content-Type: application/json\r');
        socket.write('\r');
        socket.write(JSON.stringify({message: 'Unauthorized'}));
        socket.end();
    }

    else
        next();
}
