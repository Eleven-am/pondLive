import {IncomingMessage, ServerResponse} from "http";
import {BodyParserMiddleware, JsonBodyParserMiddleware} from "./bodyParser";
import {Socket} from "net";
import {CorsMiddleware} from "./cors";

describe('BodyParserMiddleware', () => {
    it('should parse body', (done) => {
        const req = new IncomingMessage(new Socket()) as any;
        const res = new ServerResponse(req);
        const next = () => {
            expect(req.body).toBe('test');
            done();
        }
        BodyParserMiddleware()(req, res, next);
        req.emit('data', 'test');
        req.emit('end');
    });
});

describe('CorsMiddleware', () => {
    it('should set cors headers', (done) => {
        const req = new IncomingMessage(new Socket());
        const res = new ServerResponse(req);
        const next = () => {
            expect(res.getHeader('Access-Control-Allow-Origin')).toBe('*');
            expect(res.getHeader('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
            expect(res.getHeader('Access-Control-Allow-Headers')).toBe('Origin, X-Requested-With, Content-Type, Accept, Authorization');
            done();
        }
        CorsMiddleware()(req, res, next);
    });
});

describe('JsonBodyParserMiddleware', () => {
    it('should parse json body', (done) => {
        const req = new IncomingMessage(new Socket()) as any;
        const res = new ServerResponse(req);
        const next = () => {
            expect(req.body).toEqual({test: 'test'});
            done();
        }
        req.headers['content-type'] = 'application/json';
        req.body = '{"test": "test"}';
        JsonBodyParserMiddleware()(req, res, next);
    });

    it('should not parse non json body', () => {
        const req = new IncomingMessage(new Socket()) as any;
        const res = new ServerResponse(req);
        const next = jest.fn();
        JsonBodyParserMiddleware()(req, res, next);
        expect(next).toBeCalled();
    });
});

describe('FileRouter', () => {

});
