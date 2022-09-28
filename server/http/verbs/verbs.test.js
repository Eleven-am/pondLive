"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var middleWare_1 = require("../helpers/middlewares/middleWare");
var verbHandler_1 = require("./verbHandler");
describe('VerbHandler /verbs', function () {
    it('should be able to add a handler to middleware', function () {
        var server = {
            on: jest.fn()
        };
        var middleware = new middleWare_1.MiddleWare(server);
        var handler = jest.fn();
        (0, verbHandler_1.VerbHandler)(middleware, '/test', 'GET', handler);
        expect(middleware.stack.length).toBe(1);
    });
    it('should call a handler when a request is made that matches', function () {
        var req = {
            url: '/test',
            method: 'GET'
        };
        var server = {
            callback: {},
            on: function (_event, callback) {
                server.callback = callback;
            },
            emit: function (req, res) {
                server.callback(req, res);
            }
        };
        var middleware = new middleWare_1.MiddleWare(server);
        var handler = jest.fn();
        (0, verbHandler_1.VerbHandler)(middleware, '/test', 'GET', handler);
        server.emit(req, {});
        expect(handler).toBeCalled();
        var handler2 = jest.fn();
        (0, verbHandler_1.VerbHandler)(middleware, '/test2', 'GET', handler2);
        server.emit(req, {});
        expect(handler2).not.toBeCalled();
    });
    it('should call a handler when a request is made that matches', function () {
        // post request
        var req = {
            url: '/test',
            method: 'POST'
        };
        var server = {
            callback: {},
            on: function (_event, callback) {
                server.callback = callback;
            },
            emit: function (req, res) {
                server.callback(req, res);
            }
        };
        var middleware = new middleWare_1.MiddleWare(server);
        var handler = jest.fn();
        (0, verbHandler_1.VerbHandler)(middleware, '/test', 'POST', handler);
        server.emit(req, {});
        expect(handler).toBeCalled();
        var handler2 = jest.fn();
        (0, verbHandler_1.VerbHandler)(middleware, '/test', 'GET', handler2);
        server.emit(req, {});
        expect(handler2).not.toBeCalled();
        // delete request
        var req2 = {
            url: '/test',
            method: 'DELETE'
        };
        var server2 = {
            callback: {},
            on: function (_event, callback) {
                server.callback = callback;
            },
            emit: function (req, res) {
                server.callback(req, res);
            }
        };
        var middleware2 = new middleWare_1.MiddleWare(server2);
        var handler3 = jest.fn();
        (0, verbHandler_1.VerbHandler)(middleware2, '/test', 'DELETE', handler3);
        server2.emit(req2, {});
        expect(handler3).toBeCalled();
        var handler4 = jest.fn();
        (0, verbHandler_1.VerbHandler)(middleware2, '/test', 'GET', handler4);
        server2.emit(req2, {});
        expect(handler4).not.toBeCalled();
        // and so on...
    });
    it('should call the next function when a request is made that does not match', function () {
        var middleware = {
            callback: {},
            generateEventRequest: function (path, url) { return path === url ? { params: {} } : null; },
            use: function (callback) {
                middleware.callback = callback;
            }
        };
        var handler = jest.fn();
        (0, verbHandler_1.VerbHandler)(middleware, '/test', 'GET', handler);
        var next = jest.fn();
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
