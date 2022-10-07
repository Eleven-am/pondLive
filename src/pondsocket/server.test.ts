import { PondError } from '../pondbase';
import { Endpoint } from './endpoint';
import { PondSocket as  PondSocket } from './pondSocket'
import request from 'superwstest';
import {ServerActions} from "./enums";

describe('server', () => {
    it('should be defined', () => {
        expect(PondSocket).toBeDefined();
    });

    it('should be instantiable', () => {
        expect(new PondSocket()).toBeInstanceOf(PondSocket);
    });

    it('should ba able to create its own server and websocket server if none is provided', () => {
        const socket = new PondSocket();
        expect(socket['_server']).toBeDefined();
        expect(socket['_socketServer']).toBeDefined();
    });

    it('should take a server and websocket server if provided', () => {
        const server = require('http').createServer();
        const socketServer = require('ws').Server;
        const socket = new PondSocket(server, socketServer);
        expect(socket['_server']).toBe(server);
        expect(socket['_socketServer']).toBe(socketServer);
    });

    it('should be able to listen on a port', () => {
        const socket = new PondSocket();
        expect(socket.listen(3001, () => {})).toBeDefined();
        socket['_server'].close();
    });

    it('should be able to create an endpoint', () => {
        const socket = new PondSocket();
        const endpoint = socket.createEndpoint('/api/socket', () => {
        });

        expect(endpoint).toBeInstanceOf(Endpoint);
        expect(endpoint['_handler']).toEqual(expect.any(Function));
    });

    it('should be able to create multiple endpoints', () => {
        const socket = new PondSocket();
        const endpoint = socket.createEndpoint('/api/socket', () => {
        });
        const endpoint2 = socket.createEndpoint('/api/socket2', () => {
        });

        expect(endpoint).toBeInstanceOf(Endpoint);
        expect(endpoint['_handler']).toEqual(expect.any(Function));
        expect(endpoint2).toBeInstanceOf(Endpoint);
        expect(endpoint2['_handler']).toEqual(expect.any(Function));
    });

    it('should throw an error when the server throws an error', () => {
        const server = require('http').createServer();
        const socket = new PondSocket(server);

        socket.listen(3001, () => {});
        expect(() => server.emit('error', new Error('test'))).toThrowError(PondError);
        server.close();
    });

    it('should be able to reject a socket', () => {
        const server = require('http').createServer();
        const socketServer = require('ws').Server;
        const socket = new PondSocket(server, socketServer);

        const socketClient = {
            write: jest.fn(),
            destroy: jest.fn(),
        }

        socket.listen(3001, () => {});
        server.emit('upgrade', {}, socketClient)
        server.close();

        // these functions are called because there is no endpoint to accept the socket
        expect(socketClient.write).toHaveBeenCalled();
        expect(socketClient.destroy).toHaveBeenCalled();
    });

    it('should be able to accept a socket if a handler is provided', async () => {
        const socket = new PondSocket();
        const server = socket.listen(3001, () => {
        })
        expect(server).toBeDefined();
        socket.createEndpoint('/api/hello', () => {});
        socket.createEndpoint('/api/:path', (req, res) => {
            expect(req.params.path).toBe('socket');
            res.accept();
        });

        await request(server)
            .ws('/api/socket')
            .expectUpgrade(res => expect(res.statusCode).toBe(101))
            .close()
            .expectClosed();

        server.close();
    });

    it('should be able to reject a socket if the handler rejects', async () => {
        const socket = new PondSocket();
        const server = socket.listen(3001, () => {
        })
        expect(server).toBeDefined();
        socket.createEndpoint('/api/:path', (req, res) => {
            expect(req.params.path).toBe('socket');
            res.reject();
        });

        await request(server)
            .ws('/api/socket')
            .expectConnectionError()

        server.close();
    });

    it('should be able to send a message after connection', async () => {
        const socket = new PondSocket();
        const server = socket.listen(3001, () => {
        })
        expect(server).toBeDefined();
        socket.createEndpoint('/api/:path', (req, res) => {
            expect(req.params.path).toBe('socket');
            res.send('testEvent', { test: 'test' });
        });

        await request(server)
            .ws('/api/socket')
            .expectUpgrade(res => expect(res.statusCode).toBe(101))
            .expectJson({
                action: ServerActions.MESSAGE,
                event: 'testEvent',
                channelName: 'SERVER',
                payload: { test: 'test' },
            })
            .close()
            .expectClosed();

        server.close();
    });
});
