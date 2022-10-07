import {AuthenticateRequest, AuthenticateUpgrade} from "./authenticateRequest";
import {BaseClass} from "../../../pondbase";

describe('authenticateRequest', () => {
    it('should reject an invalid cookie', () => {
        const authenticateRequest = AuthenticateRequest('secret', 'cookie');
        const req = {
            headers: {
                cookie: 'cookie=guvehdjknwklnfjw;'
            }
        } as any;
        const res = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        } as any;
        const next = jest.fn();

        authenticateRequest(req, res, next);

        expect(req.clientId).toBeUndefined();
        expect(req.token).toBeUndefined();
        expect(next).not.toBeCalled();

        expect(res.writeHead).toBeCalledWith(401, {'Content-Type': 'application/json'});
        expect(res.end).toBeCalledWith(JSON.stringify({message: 'Unauthorized'}));
    });

    it('should reject an expired cookie', () => {
        const base = new BaseClass();
        const cookie = base.encrypt('secret', {time: '123456789'});
        const authenticateRequest = AuthenticateRequest('secret', 'cookie');
        const req = {
            headers: {
                cookie: `cookie=${cookie};`
            }
        } as any;

        const res = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        } as any;

        const next = jest.fn();

        authenticateRequest(req, res, next);

        expect(req.clientId).toBeUndefined();
        expect(req.token).toBeUndefined();
        expect(next).not.toBeCalled();

        expect(res.writeHead).toBeCalledWith(401, {'Content-Type': 'application/json'});
        expect(res.end).toBeCalledWith(JSON.stringify({message: 'Unauthorized'}));
    });

    it('should accept a valid cookie', () => {
        const base = new BaseClass();
        const cookie = base.encrypt('secret', {time: Date.now().toString()});
        const authenticateRequest = AuthenticateRequest('secret', 'cookie');
        const req = {
            headers: {
                cookie: `cookie=${cookie};`
            }
        } as any;

        const res = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        } as any;

        const next = jest.fn();

        authenticateRequest(req, res, next);

        expect(req.clientId).toBeDefined();
        expect(req.token).toBeDefined();
        expect(next).toBeCalled();

        expect(res.writeHead).not.toBeCalled();
        expect(res.end).not.toBeCalled();
    });

    it('should add a cookie to the response', () => {
        const authenticateRequest = AuthenticateRequest('secret', 'cookie');
        const req = {} as any;

        const res = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        } as any;

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
        const authenticateRequest = AuthenticateUpgrade('secret', 'cookie');
        const req = {
            headers: {
                cookie: 'cookie=guvehdjknwklnfjw;'
            }
        } as any;
        const socket = {
            write: jest.fn(),
            end: jest.fn(),
        } as any;
        const head = {} as any;

        const next = jest.fn();

        authenticateRequest(req, socket, head, next);

        expect(req.clientId).toBeUndefined();
        expect(req.token).toBeUndefined();
        expect(next).not.toBeCalled();

        expect(socket.write).toBeCalled();
        expect(socket.end).toBeCalled();
    });

    it('should reject an expired cookie', () => {
        const base = new BaseClass();
        const cookie = base.encrypt('secret', {time: '123456789'});
        const authenticateRequest = AuthenticateUpgrade('secret', 'cookie');
        const req = {
            headers: {
                cookie: `cookie=${cookie};`
            }
        } as any;
        const socket = {
            write: jest.fn(),
            end: jest.fn(),
        } as any;
        const head = {} as any;

        const next = jest.fn();

        authenticateRequest(req, socket, head, next);

        expect(req.clientId).toBeUndefined();
        expect(req.token).toBeUndefined();
        expect(next).not.toBeCalled();

        expect(socket.write).toBeCalled();
        expect(socket.end).toBeCalled();
    });

    it('should accept a valid cookie', () => {
        const base = new BaseClass();
        const cookie = base.encrypt('secret', {time: Date.now().toString()});
        const authenticateRequest = AuthenticateUpgrade('secret', 'cookie');
        const req = {
            headers: {
                cookie: `cookie=${cookie};`
            }
        } as any;
        const socket = {
            write: jest.fn(),
            end: jest.fn(),
        } as any;
        const head = {} as any;

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
        const authenticateRequest = AuthenticateUpgrade('secret', 'cookie');
        const req = {
            headers: {}
        } as any;
        const socket = {
            write: jest.fn(),
            end: jest.fn(),
        } as any;
        const head = {} as any;

        const next = jest.fn();

        authenticateRequest(req, socket, head, next);

        expect(req.clientId).toBeUndefined();
        expect(req.token).toBeUndefined();
        expect(next).not.toBeCalled();

        expect(socket.write).toBeCalled();
        expect(socket.end).toBeCalled();
    });
});
