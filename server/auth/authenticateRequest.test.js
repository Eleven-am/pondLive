"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const authenticate_1 = require("./authenticate");
const http_1 = require("http");
const baseClass_1 = require("../../utils/baseClass");
const pondsocket_1 = require("@eleven-am/pondsocket");
const createRequest = (cookie) => {
    const req = {
        headers: {
            cookie: cookie ? `cookie=${cookie};` : undefined
        },
        on: jest.fn(),
        auth: {}
    };
    const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
        setHeader: jest.fn(),
        setCookie: jest.fn(),
        clearCookie: jest.fn(),
    };
    const next = jest.fn();
    return { next, res, req };
};
describe('authenticateRequest', () => {
    it('should reject an invalid cookie', () => {
        const authenticateRequest = (0, authenticate_1.AuthorizeRequest)('secret', 'cookie');
        const { next, res, req } = createRequest('guvehdjknwklnfjw');
        authenticateRequest(req, res, next);
        expect(req.auth.clientId).toBeNull();
        expect(req.auth.token).toBeNull();
        expect(next).not.toBeCalled();
        expect(res.json).toBeCalledWith({ message: 'Unauthorized' });
    });
    it('should reject an expired cookie', () => {
        const base = new baseClass_1.BaseClass();
        const cookie = base.encrypt('secret', { time: '123456789' });
        const authenticateRequest = (0, authenticate_1.AuthorizeRequest)('secret', 'cookie');
        const { next, res, req } = createRequest(cookie);
        authenticateRequest(req, res, next);
        expect(req.auth.clientId).toBeNull();
        expect(req.auth.token).toBeNull();
        expect(next).not.toBeCalled();
        expect(res.json).toBeCalledWith({ message: 'Unauthorized' });
    });
    it('should accept a valid cookie', () => {
        const base = new baseClass_1.BaseClass();
        const cookie = base.encrypt('secret', { time: Date.now().toString() });
        const authenticateRequest = (0, authenticate_1.AuthorizeRequest)('secret', 'cookie');
        const { next, res, req } = createRequest(cookie);
        authenticateRequest(req, res, next);
        expect(req.auth.clientId).toBeDefined();
        expect(req.auth.token).toBeDefined();
        expect(next).toBeCalled();
        expect(res.json).not.toBeCalled();
    });
    it('should add a cookie to the response', () => {
        const authenticateRequest = (0, authenticate_1.AuthorizeRequest)('secret', 'cookie');
        const { next, res, req } = createRequest();
        authenticateRequest(req, res, next);
        expect(req.auth.clientId).toBeDefined();
        expect(req.auth.token).toBeDefined();
        expect(next).toBeCalled();
        expect(res.json).not.toBeCalled();
        expect(res.setHeader).toBeCalledWith('Set-Cookie', expect.any(String));
    });
    it('should be able to take a custom auth function', () => {
        const authenticateRequest = (0, authenticate_1.AuthorizeRequest)('secret', 'cookie', () => ({ clientId: null, token: '456' }));
        const { next, res, req } = createRequest();
        authenticateRequest(req, res, next);
        expect(req.auth.clientId).toBeNull();
        expect(req.auth.token).toBeNull();
        expect(next).not.toBeCalled();
        const authenticateRequest2 = (0, authenticate_1.AuthorizeRequest)('secret', 'cookie', () => ({ clientId: '123', token: '456' }));
        const { next: next2, res: res2, req: req2 } = createRequest();
        authenticateRequest2(req2, res2, next2);
        expect(req2.auth.clientId).toBeDefined();
        expect(req2.auth.token).toBeDefined();
        expect(next2).toBeCalled();
        expect(res2.json).not.toBeCalled();
    });
});
describe('AuthorizeUpgrade', () => {
    it('should run authentication on a socket upgrade request', () => __awaiter(void 0, void 0, void 0, function* () {
        const server = (0, http_1.createServer)();
        const mock = jest.fn();
        const pond = new pondsocket_1.PondSocket(server);
        const authenticateUpgrade = (0, authenticate_1.AuthorizeUpgrade)('secret', 'cookie', () => ({ clientId: null, token: '456' }));
        pond.createEndpoint('/test', (request, response) => {
            mock();
            authenticateUpgrade(request, response);
        });
        const req = {
            url: '/test',
            on: jest.fn(),
        };
        const socket = {
            on: jest.fn(),
            write: jest.fn(),
            destroy: jest.fn(),
        };
        yield server.emit('upgrade', req, socket, Buffer.from(''));
        // it should fail the authentication
        // but because it is an async function, it will not be called until the next tick
        expect(mock).toBeCalled();
        expect(socket.write).toBeCalled();
        expect(socket.destroy).toBeCalled();
    }));
});
