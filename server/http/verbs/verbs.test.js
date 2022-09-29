"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const middleWare_1 = require("../helpers/middlewares/middleWare");
const verbHandler_1 = require("./verbHandler");
describe('VerbHandler /verbs', () => {
    it('should be able to add a handler to middleware', () => {
        const server = {
            on: jest.fn()
        };
        const middleware = new middleWare_1.MiddleWare(server);
        const handler = jest.fn();
        (0, verbHandler_1.VerbHandler)(middleware, '/test', 'GET', handler);
        expect(middleware.stack.length).toBe(1);
    });
    it('should call a handler when a request is made that matches', () => {
        const req = {
            url: '/test',
            method: 'GET'
        };
        const server = {
            callback: {},
            on: (_event, callback) => {
                server.callback = callback;
            },
            emit: (req, res) => {
                server.callback(req, res);
            }
        };
        const middleware = new middleWare_1.MiddleWare(server);
        const handler = jest.fn();
        (0, verbHandler_1.VerbHandler)(middleware, '/test', 'GET', handler);
        server.emit(req, {});
        expect(handler).toBeCalled();
        const handler2 = jest.fn();
        (0, verbHandler_1.VerbHandler)(middleware, '/test2', 'GET', handler2);
        server.emit(req, {});
        expect(handler2).not.toBeCalled();
    });
    it('should call a handler when a request is made that matches', () => {
        // post request
        const req = {
            url: '/test',
            method: 'POST'
        };
        const server = {
            callback: {},
            on: (_event, callback) => {
                server.callback = callback;
            },
            emit: (req, res) => {
                server.callback(req, res);
            }
        };
        const middleware = new middleWare_1.MiddleWare(server);
        const handler = jest.fn();
        (0, verbHandler_1.VerbHandler)(middleware, '/test', 'POST', handler);
        server.emit(req, {});
        expect(handler).toBeCalled();
        const handler2 = jest.fn();
        (0, verbHandler_1.VerbHandler)(middleware, '/test', 'GET', handler2);
        server.emit(req, {});
        expect(handler2).not.toBeCalled();
        // delete request
        const req2 = {
            url: '/test',
            method: 'DELETE'
        };
        const server2 = {
            callback: {},
            on: (_event, callback) => {
                server.callback = callback;
            },
            emit: (req, res) => {
                server.callback(req, res);
            }
        };
        const middleware2 = new middleWare_1.MiddleWare(server2);
        const handler3 = jest.fn();
        (0, verbHandler_1.VerbHandler)(middleware2, '/test', 'DELETE', handler3);
        server2.emit(req2, {});
        expect(handler3).toBeCalled();
        const handler4 = jest.fn();
        (0, verbHandler_1.VerbHandler)(middleware2, '/test', 'GET', handler4);
        server2.emit(req2, {});
        expect(handler4).not.toBeCalled();
        // and so on...
    });
    it('should call the next function when a request is made that does not match', () => {
        const middleware = {
            callback: {},
            generateEventRequest: (path, url) => path === url ? { params: {} } : null,
            use: (callback) => {
                middleware.callback = callback;
            }
        };
        const handler = jest.fn();
        (0, verbHandler_1.VerbHandler)(middleware, '/test', 'GET', handler);
        const next = jest.fn();
        middleware.callback({
            url: '/test',
            method: 'POST'
        }, {}, next);
        expect(next).toBeCalled();
        //reset next
        next.mockReset();
        middleware.callback({
            url: '/test2',
            method: 'GET'
        }, {}, next);
        expect(next).toBeCalled();
        //reset next
        next.mockReset();
        middleware.callback({
            url: '/test',
            method: 'GET'
        }, {}, next);
        expect(next).not.toBeCalled();
        //reset next
        next.mockReset();
        middleware.callback({
            method: 'GET' // no url
        }, {}, next);
        expect(next).toBeCalled();
    });
});
