"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authenticateRequest_1 = require("./authenticateRequest");
const baseClass_1 = require("../../../utils/baseClass");
describe('authenticateRequest', () => {
    it('should reject an invalid cookie', () => {
        const authenticateRequest = (0, authenticateRequest_1.AuthenticateRequest)('secret', 'cookie');
        const req = {
            headers: {
                cookie: 'cookie=guvehdjknwklnfjw;'
            }
        };
        const res = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        const next = jest.fn();
        authenticateRequest(req, res, next);
        expect(req.clientId).toBeUndefined();
        expect(req.token).toBeUndefined();
        expect(next).not.toBeCalled();
        expect(res.writeHead).toBeCalledWith(401, { 'Content-Type': 'application/json' });
        expect(res.end).toBeCalledWith(JSON.stringify({ message: 'Unauthorized' }));
    });
    it('should reject an expired cookie', () => {
        const base = new baseClass_1.BaseClass();
        const cookie = base.encrypt('secret', { time: '123456789' });
        const authenticateRequest = (0, authenticateRequest_1.AuthenticateRequest)('secret', 'cookie');
        const req = {
            headers: {
                cookie: `cookie=${cookie};`
            }
        };
        const res = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        const next = jest.fn();
        authenticateRequest(req, res, next);
        expect(req.clientId).toBeUndefined();
        expect(req.token).toBeUndefined();
        expect(next).not.toBeCalled();
        expect(res.writeHead).toBeCalledWith(401, { 'Content-Type': 'application/json' });
        expect(res.end).toBeCalledWith(JSON.stringify({ message: 'Unauthorized' }));
    });
    it('should accept a valid cookie', () => {
        const base = new baseClass_1.BaseClass();
        const cookie = base.encrypt('secret', { time: Date.now().toString() });
        const authenticateRequest = (0, authenticateRequest_1.AuthenticateRequest)('secret', 'cookie');
        const req = {
            headers: {
                cookie: `cookie=${cookie};`
            }
        };
        const res = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        const next = jest.fn();
        authenticateRequest(req, res, next);
        expect(req.clientId).toBeDefined();
        expect(req.token).toBeDefined();
        expect(next).toBeCalled();
        expect(res.writeHead).not.toBeCalled();
        expect(res.end).not.toBeCalled();
    });
    it('should add a cookie to the response', () => {
        const authenticateRequest = (0, authenticateRequest_1.AuthenticateRequest)('secret', 'cookie');
        const req = {};
        const res = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        const next = jest.fn();
        authenticateRequest(req, res, next);
        expect(req.clientId).toBeDefined();
        expect(req.token).toBeDefined();
        expect(next).toBeCalled();
        expect(res.writeHead).not.toBeCalled();
        expect(res.end).not.toBeCalled();
        expect(res.setHeader).toBeCalledWith('Set-Cookie', expect.any(String));
    });
});
describe('AuthenticateUpgrade', () => {
    it('should reject an invalid cookie', () => {
        const authenticateRequest = (0, authenticateRequest_1.AuthenticateUpgrade)('secret', 'cookie');
        const req = {
            headers: {
                cookie: 'cookie=guvehdjknwklnfjw;'
            }
        };
        const socket = {
            write: jest.fn(),
            end: jest.fn(),
        };
        const head = {};
        const next = jest.fn();
        authenticateRequest(req, socket, head, next);
        expect(req.clientId).toBeUndefined();
        expect(req.token).toBeUndefined();
        expect(next).not.toBeCalled();
        expect(socket.write).toBeCalled();
        expect(socket.end).toBeCalled();
    });
    it('should reject an expired cookie', () => {
        const base = new baseClass_1.BaseClass();
        const cookie = base.encrypt('secret', { time: '123456789' });
        const authenticateRequest = (0, authenticateRequest_1.AuthenticateUpgrade)('secret', 'cookie');
        const req = {
            headers: {
                cookie: `cookie=${cookie};`
            }
        };
        const socket = {
            write: jest.fn(),
            end: jest.fn(),
        };
        const head = {};
        const next = jest.fn();
        authenticateRequest(req, socket, head, next);
        expect(req.clientId).toBeUndefined();
        expect(req.token).toBeUndefined();
        expect(next).not.toBeCalled();
        expect(socket.write).toBeCalled();
        expect(socket.end).toBeCalled();
    });
    it('should accept a valid cookie', () => {
        const base = new baseClass_1.BaseClass();
        const cookie = base.encrypt('secret', { time: Date.now().toString() });
        const authenticateRequest = (0, authenticateRequest_1.AuthenticateUpgrade)('secret', 'cookie');
        const req = {
            headers: {
                cookie: `cookie=${cookie};`
            }
        };
        const socket = {
            write: jest.fn(),
            end: jest.fn(),
        };
        const head = {};
        const next = jest.fn();
        authenticateRequest(req, socket, head, next);
        // Never writes cookies, never writes to the request object either
        expect(req.clientId).not.toBeDefined();
        expect(req.token).not.toBeDefined();
        expect(next).toBeCalled();
        expect(socket.write).not.toBeCalled();
        expect(socket.end).not.toBeCalled();
    });
    it('should reject if no cookie', () => {
        const authenticateRequest = (0, authenticateRequest_1.AuthenticateUpgrade)('secret', 'cookie');
        const req = {
            headers: {}
        };
        const socket = {
            write: jest.fn(),
            end: jest.fn(),
        };
        const head = {};
        const next = jest.fn();
        authenticateRequest(req, socket, head, next);
        expect(req.clientId).toBeUndefined();
        expect(req.token).toBeUndefined();
        expect(next).not.toBeCalled();
        expect(socket.write).toBeCalled();
        expect(socket.end).toBeCalled();
    });
});
