"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var bodyParser_1 = require("./bodyParser");
var net_1 = require("net");
var cors_1 = require("./cors");
describe('BodyParserMiddleware', function () {
    it('should parse body', function (done) {
        var req = new http_1.IncomingMessage(new net_1.Socket());
        var res = new http_1.ServerResponse(req);
        var next = function () {
            expect(req.body).toBe('test');
            done();
        };
        (0, bodyParser_1.BodyParserMiddleware)()(req, res, next);
        req.emit('data', 'test');
        req.emit('end');
    });
});
describe('CorsMiddleware', function () {
    it('should set cors headers', function (done) {
        var req = new http_1.IncomingMessage(new net_1.Socket());
        var res = new http_1.ServerResponse(req);
        var next = function () {
            expect(res.getHeader('Access-Control-Allow-Origin')).toBe('*');
            expect(res.getHeader('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
            expect(res.getHeader('Access-Control-Allow-Headers')).toBe('Origin, X-Requested-With, Content-Type, Accept, Authorization');
            done();
        };
        (0, cors_1.CorsMiddleware)()(req, res, next);
    });
});
describe('JsonBodyParserMiddleware', function () {
    it('should parse json body', function (done) {
        var req = new http_1.IncomingMessage(new net_1.Socket());
        var res = new http_1.ServerResponse(req);
        var next = function () {
            expect(req.body).toEqual({ test: 'test' });
            done();
        };
        req.headers['content-type'] = 'application/json';
        req.body = '{"test": "test"}';
        (0, bodyParser_1.JsonBodyParserMiddleware)()(req, res, next);
    });
    it('should not parse non json body', function () {
        var req = new http_1.IncomingMessage(new net_1.Socket());
        var res = new http_1.ServerResponse(req);
        var next = jest.fn();
        (0, bodyParser_1.JsonBodyParserMiddleware)()(req, res, next);
        expect(next).toBeCalled();
    });
});
describe('FileRouter', function () {
});
