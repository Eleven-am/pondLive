"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var authenticateRequest_1 = require("./authenticateRequest");
var baseClass_1 = require("../../../utils/baseClass");
describe('authenticateRequest', function () {
    it('should reject an invalid cookie', function () {
        var authenticateRequest = (0, authenticateRequest_1.AuthenticateRequest)('secret', 'cookie');
        var req = {
            headers: {
                cookie: 'cookie=guvehdjknwklnfjw;'
            }
        };
        var res = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        var next = jest.fn();
        authenticateRequest(req, res, next);
        expect(req.clientId).toBeUndefined();
        expect(req.token).toBeUndefined();
        expect(next).not.toBeCalled();
        expect(res.writeHead).toBeCalledWith(401, { 'Content-Type': 'application/json' });
        expect(res.end).toBeCalledWith(JSON.stringify({ message: 'Unauthorized' }));
    });
    it('should reject an expired cookie', function () {
        var base = new baseClass_1.BaseClass();
        var cookie = base.encrypt('secret', { time: '123456789' });
        var authenticateRequest = (0, authenticateRequest_1.AuthenticateRequest)('secret', 'cookie');
        var req = {
            headers: {
                cookie: "cookie=".concat(cookie, ";")
            }
        };
        var res = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        var next = jest.fn();
        authenticateRequest(req, res, next);
        expect(req.clientId).toBeUndefined();
        expect(req.token).toBeUndefined();
        expect(next).not.toBeCalled();
        expect(res.writeHead).toBeCalledWith(401, { 'Content-Type': 'application/json' });
        expect(res.end).toBeCalledWith(JSON.stringify({ message: 'Unauthorized' }));
    });
    it('should accept a valid cookie', function () {
        var base = new baseClass_1.BaseClass();
        var cookie = base.encrypt('secret', { time: Date.now().toString() });
        var authenticateRequest = (0, authenticateRequest_1.AuthenticateRequest)('secret', 'cookie');
        var req = {
            headers: {
                cookie: "cookie=".concat(cookie, ";")
            }
        };
        var res = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        var next = jest.fn();
        authenticateRequest(req, res, next);
        expect(req.clientId).toBeDefined();
        expect(req.token).toBeDefined();
        expect(next).toBeCalled();
        expect(res.writeHead).not.toBeCalled();
        expect(res.end).not.toBeCalled();
    });
    it('should add a cookie to the response', function () {
        var authenticateRequest = (0, authenticateRequest_1.AuthenticateRequest)('secret', 'cookie');
        var req = {};
        var res = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        var next = jest.fn();
        authenticateRequest(req, res, next);
        expect(req.clientId).toBeDefined();
        expect(req.token).toBeDefined();
        expect(next).toBeCalled();
        expect(res.writeHead).not.toBeCalled();
        expect(res.end).not.toBeCalled();
        expect(res.setHeader).toBeCalledWith('Set-Cookie', expect.any(String));
    });
});
describe('AuthenticateUpgrade', function () {
    it('should reject an invalid cookie', function () {
        var authenticateRequest = (0, authenticateRequest_1.AuthenticateUpgrade)('secret', 'cookie');
        var req = {
            headers: {
                cookie: 'cookie=guvehdjknwklnfjw;'
            }
        };
        var socket = {
            write: jest.fn(),
            end: jest.fn(),
        };
        var head = {};
        var next = jest.fn();
        authenticateRequest(req, socket, head, next);
        expect(req.clientId).toBeUndefined();
        expect(req.token).toBeUndefined();
        expect(next).not.toBeCalled();
        expect(socket.write).toBeCalled();
        expect(socket.end).toBeCalled();
    });
    it('should reject an expired cookie', function () {
        var base = new baseClass_1.BaseClass();
        var cookie = base.encrypt('secret', { time: '123456789' });
        var authenticateRequest = (0, authenticateRequest_1.AuthenticateUpgrade)('secret', 'cookie');
        var req = {
            headers: {
                cookie: "cookie=".concat(cookie, ";")
            }
        };
        var socket = {
            write: jest.fn(),
            end: jest.fn(),
        };
        var head = {};
        var next = jest.fn();
        authenticateRequest(req, socket, head, next);
        expect(req.clientId).toBeUndefined();
        expect(req.token).toBeUndefined();
        expect(next).not.toBeCalled();
        expect(socket.write).toBeCalled();
        expect(socket.end).toBeCalled();
    });
    it('should accept a valid cookie', function () {
        var base = new baseClass_1.BaseClass();
        var cookie = base.encrypt('secret', { time: Date.now().toString() });
        var authenticateRequest = (0, authenticateRequest_1.AuthenticateUpgrade)('secret', 'cookie');
        var req = {
            headers: {
                cookie: "cookie=".concat(cookie, ";")
            }
        };
        var socket = {
            write: jest.fn(),
            end: jest.fn(),
        };
        var head = {};
        var next = jest.fn();
        authenticateRequest(req, socket, head, next);
        // Never writes cookies, never writes to the request object either
        expect(req.clientId).not.toBeDefined();
        expect(req.token).not.toBeDefined();
        expect(next).toBeCalled();
        expect(socket.write).not.toBeCalled();
        expect(socket.end).not.toBeCalled();
    });
    it('should reject if no cookie', function () {
        var authenticateRequest = (0, authenticateRequest_1.AuthenticateUpgrade)('secret', 'cookie');
        var req = {
            headers: {}
        };
        var socket = {
            write: jest.fn(),
            end: jest.fn(),
        };
        var head = {};
        var next = jest.fn();
        authenticateRequest(req, socket, head, next);
        expect(req.clientId).toBeUndefined();
        expect(req.token).toBeUndefined();
        expect(next).not.toBeCalled();
        expect(socket.write).toBeCalled();
        expect(socket.end).toBeCalled();
    });
});
