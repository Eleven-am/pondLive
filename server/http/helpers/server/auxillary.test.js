"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const bodyParser_1 = require("./bodyParser");
const net_1 = require("net");
const cors_1 = require("./cors");
describe('BodyParserMiddleware', () => {
    it('should parse body', (done) => {
        const req = new http_1.IncomingMessage(new net_1.Socket());
        const res = new http_1.ServerResponse(req);
        const next = () => {
            expect(req.body).toBe('test');
            done();
        };
        (0, bodyParser_1.BodyParserMiddleware)()(req, res, next);
        req.emit('data', 'test');
        req.emit('end');
    });
});
describe('CorsMiddleware', () => {
    it('should set cors headers', (done) => {
        const req = new http_1.IncomingMessage(new net_1.Socket());
        const res = new http_1.ServerResponse(req);
        const next = () => {
            expect(res.getHeader('Access-Control-Allow-Origin')).toBe('*');
            expect(res.getHeader('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
            expect(res.getHeader('Access-Control-Allow-Headers')).toBe('Origin, X-Requested-With, Content-Type, Accept, Authorization');
            done();
        };
        (0, cors_1.CorsMiddleware)()(req, res, next);
    });
});
describe('JsonBodyParserMiddleware', () => {
    it('should parse json body', (done) => {
        const req = new http_1.IncomingMessage(new net_1.Socket());
        const res = new http_1.ServerResponse(req);
        const next = () => {
            expect(req.body).toEqual({ test: 'test' });
            done();
        };
        req.headers['content-type'] = 'application/json';
        req.body = '{"test": "test"}';
        (0, bodyParser_1.JsonBodyParserMiddleware)()(req, res, next);
    });
    it('should not parse non json body', () => {
        const req = new http_1.IncomingMessage(new net_1.Socket());
        const res = new http_1.ServerResponse(req);
        const next = jest.fn();
        (0, bodyParser_1.JsonBodyParserMiddleware)()(req, res, next);
        expect(next).toBeCalled();
    });
});
