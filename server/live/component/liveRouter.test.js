"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var liveRouter_1 = require("./liveRouter");
var utils_1 = require("../../utils");
describe('liveRouter', function () {
    it('should create a router from a pond response', function () {
        var resolver = jest.fn();
        var assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        var response = new utils_1.PondResponse({}, assigns, resolver);
        var router = new liveRouter_1.LiveRouter(response);
        expect(router).toBeTruthy();
    });
    it('should create a router from a http server response', function () {
        var response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        var router = new liveRouter_1.LiveRouter(response);
        expect(router).toBeTruthy();
    });
    it('should create a router from a http client response', function () {
        var response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        var router = new liveRouter_1.LiveRouter(response, 'client-router');
        expect(router).toBeTruthy();
    });
    it('should be able to set the page title', function () {
        var response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        var router = new liveRouter_1.LiveRouter(response);
        router.pageTitle = 'test';
        expect(router.headers.pageTitle).toBe('test');
    });
    it('should be able to set the flash message', function () {
        var response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        var router = new liveRouter_1.LiveRouter(response);
        router.flashMessage = 'test';
        expect(router.headers.flashMessage).toBe('test');
    });
    it('should be capable of returning a the router headers', function () {
        var response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        var router = new liveRouter_1.LiveRouter(response);
        router.pageTitle = 'test';
        router.flashMessage = 'test';
        expect(router.headers).toEqual({
            pageTitle: 'test',
            flashMessage: 'test',
        });
    });
    it('should be capable of redirecting', function () {
        var response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        var router = new liveRouter_1.LiveRouter(response);
        router.redirect('/test');
        expect(response.writeHead).toBeCalledWith(302, {
            Location: '/test',
        });
        expect(response.end).toBeCalled();
        var response2 = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        var router2 = new liveRouter_1.LiveRouter(response2, 'client-router');
        router2.redirect('/test');
        expect(response2.setHeader).toBeCalledWith('x-router-action', 'redirect');
        expect(response2.setHeader).toBeCalledWith('x-router-path', '/test');
        var assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        var resolver = jest.fn();
        var response3 = new utils_1.PondResponse({}, assigns, resolver);
        var router3 = new liveRouter_1.LiveRouter(response3);
        router3.redirect('/test');
        expect(resolver).toBeCalled();
    });
    it('should be capable of pushing', function () {
        var response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        var router = new liveRouter_1.LiveRouter(response);
        router.push('/test');
        expect(response.writeHead).toBeCalledWith(302, {
            Location: '/test',
        });
        expect(response.end).toBeCalled();
        var response2 = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        var router2 = new liveRouter_1.LiveRouter(response2, 'client-router');
        router2.push('/test');
        expect(response2.setHeader).toBeCalledWith('x-router-action', 'push');
        expect(response2.setHeader).toBeCalledWith('x-router-path', '/test');
        var assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        var resolver = jest.fn();
        var response3 = new utils_1.PondResponse({}, assigns, resolver);
        var router3 = new liveRouter_1.LiveRouter(response3);
        router3.push('/test');
        expect(resolver).toBeCalled();
    });
    it('should be capable of replacing', function () {
        var response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        var router = new liveRouter_1.LiveRouter(response);
        router.replace('/test');
        expect(response.writeHead).toBeCalledWith(302, {
            Location: '/test',
        });
        expect(response.end).toBeCalled();
        var response2 = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        var router2 = new liveRouter_1.LiveRouter(response2, 'client-router');
        router2.replace('/test');
        expect(response2.setHeader).toBeCalledWith('x-router-action', 'replace');
        expect(response2.setHeader).toBeCalledWith('x-router-path', '/test');
        var assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        var resolver = jest.fn();
        var response3 = new utils_1.PondResponse({}, assigns, resolver);
        var router3 = new liveRouter_1.LiveRouter(response3);
        router3.replace('/test');
        expect(resolver).toBeCalled();
    });
    it('should fail to perform multiple actions since a response is sent', function () {
        var response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        var router = new liveRouter_1.LiveRouter(response);
        router.redirect('/test');
        expect(router.sentResponse).toBe(true);
        expect(function () { return router.redirect('/test'); }).toThrow();
        var response2 = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        var router2 = new liveRouter_1.LiveRouter(response2, 'client-router');
        router2.redirect('/test');
        expect(router2.sentResponse).toBe(true);
        expect(function () { return router2.redirect('/test'); }).toThrow();
        var assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        var resolver = jest.fn();
        var response3 = new utils_1.PondResponse({}, assigns, resolver);
        var router3 = new liveRouter_1.LiveRouter(response3);
        router3.redirect('/test');
        expect(router3.sentResponse).toBe(true);
        expect(function () { return router3.redirect('/test'); }).toThrow();
    });
});
