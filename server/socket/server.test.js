"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const endpoint_1 = require("./endpoint");
const pondSocket_1 = require("./pondSocket");
const superwstest_1 = __importDefault(require("superwstest"));
const enums_1 = require("../enums");
describe('server', () => {
    it('should be defined', () => {
        expect(pondSocket_1.PondSocket).toBeDefined();
    });
    it('should be instantiable', () => {
        expect(new pondSocket_1.PondSocket()).toBeInstanceOf(pondSocket_1.PondSocket);
    });
    it('should ba able to create its own server and websocket server if none is provided', () => {
        const socket = new pondSocket_1.PondSocket();
        expect(socket['_server']).toBeDefined();
        expect(socket['_socketServer']).toBeDefined();
    });
    it('should take a server and websocket server if provided', () => {
        const server = require('http').createServer();
        const socketServer = require('ws').Server;
        const socket = new pondSocket_1.PondSocket(server, socketServer);
        expect(socket['_server']).toBe(server);
        expect(socket['_socketServer']).toBe(socketServer);
    });
    it('should be able to listen on a port', () => {
        const socket = new pondSocket_1.PondSocket();
        expect(socket.listen(3001, () => { })).toBeDefined();
        socket['_server'].close();
    });
    it('should be able to create an endpoint', () => {
        const socket = new pondSocket_1.PondSocket();
        const endpoint = socket.createEndpoint('/api/socket', () => {
        });
        expect(endpoint).toBeInstanceOf(endpoint_1.Endpoint);
        expect(endpoint['_handler']).toEqual(expect.any(Function));
    });
    it('should be able to create multiple endpoints', () => {
        const socket = new pondSocket_1.PondSocket();
        const endpoint = socket.createEndpoint('/api/socket', () => {
        });
        const endpoint2 = socket.createEndpoint('/api/socket2', () => {
        });
        expect(endpoint).toBeInstanceOf(endpoint_1.Endpoint);
        expect(endpoint['_handler']).toEqual(expect.any(Function));
        expect(endpoint2).toBeInstanceOf(endpoint_1.Endpoint);
        expect(endpoint2['_handler']).toEqual(expect.any(Function));
    });
    it('should throw an error when the server throws an error', () => {
        const server = require('http').createServer();
        const socket = new pondSocket_1.PondSocket(server);
        socket.listen(3001, () => { });
        expect(() => server.emit('error', new Error('test'))).toThrowError(utils_1.PondError);
        server.close();
    });
    it('should be able to reject a socket', () => {
        const server = require('http').createServer();
        const socketServer = require('ws').Server;
        const socket = new pondSocket_1.PondSocket(server, socketServer);
        const socketClient = {
            write: jest.fn(),
            destroy: jest.fn(),
        };
        socket.listen(3001, () => { });
        server.emit('upgrade', {}, socketClient);
        server.close();
        // these functions are called because there is no endpoint to accept the socket
        expect(socketClient.write).toHaveBeenCalled();
        expect(socketClient.destroy).toHaveBeenCalled();
    });
    it('should be able to accept a socket if a handler is provided', async () => {
        const socket = new pondSocket_1.PondSocket();
        const server = socket.listen(3001, () => {
        });
        expect(server).toBeDefined();
        socket.createEndpoint('/api/hello', () => { });
        socket.createEndpoint('/api/:path', (req, res) => {
            expect(req.params.path).toBe('socket');
            res.accept();
        });
        await (0, superwstest_1.default)(server)
            .ws('/api/socket')
            .expectUpgrade(res => expect(res.statusCode).toBe(101))
            .close()
            .expectClosed();
        server.close();
    });
    it('should be able to reject a socket if the handler rejects', async () => {
        const socket = new pondSocket_1.PondSocket();
        const server = socket.listen(3001, () => {
        });
        expect(server).toBeDefined();
        socket.createEndpoint('/api/:path', (req, res) => {
            expect(req.params.path).toBe('socket');
            res.reject();
        });
        await (0, superwstest_1.default)(server)
            .ws('/api/socket')
            .expectConnectionError();
        server.close();
    });
    it('should be able to send a message after connection', async () => {
        const socket = new pondSocket_1.PondSocket();
        const server = socket.listen(3001, () => {
        });
        expect(server).toBeDefined();
        socket.createEndpoint('/api/:path', (req, res) => {
            expect(req.params.path).toBe('socket');
            res.send('testEvent', { test: 'test' });
        });
        await (0, superwstest_1.default)(server)
            .ws('/api/socket')
            .expectUpgrade(res => expect(res.statusCode).toBe(101))
            .expectJson({
            action: enums_1.ServerActions.MESSAGE,
            event: 'testEvent',
            channelName: 'SERVER',
            payload: { test: 'test' },
        })
            .close()
            .expectClosed();
        server.close();
    });
});
