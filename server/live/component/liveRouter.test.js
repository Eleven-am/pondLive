"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const liveRouter_1 = require("./liveRouter");
const utils_1 = require("../../utils");
describe('liveRouter', () => {
    it('should create a router from a pond response', () => {
        const resolver = jest.fn();
        const assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        const response = new utils_1.PondResponse({}, assigns, resolver);
        const router = new liveRouter_1.LiveRouter(response);
        expect(router).toBeTruthy();
    });
    it('should create a router from a http server response', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        const router = new liveRouter_1.LiveRouter(response);
        expect(router).toBeTruthy();
    });
    it('should create a router from a http client response', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        const router = new liveRouter_1.LiveRouter(response, 'client-router');
        expect(router).toBeTruthy();
    });
    it('should be able to set the page title', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        const router = new liveRouter_1.LiveRouter(response);
        router.pageTitle = 'test';
        expect(router.headers.pageTitle).toBe('test');
    });
    it('should be able to set the flash message', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        const router = new liveRouter_1.LiveRouter(response);
        router.flashMessage = 'test';
        expect(router.headers.flashMessage).toBe('test');
    });
    it('should be capable of returning a the router headers', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        const router = new liveRouter_1.LiveRouter(response);
        router.pageTitle = 'test';
        router.flashMessage = 'test';
        expect(router.headers).toEqual({
            pageTitle: 'test',
            flashMessage: 'test',
        });
    });
    it('should be capable of redirecting', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        const router = new liveRouter_1.LiveRouter(response);
        router.redirect('/test');
        expect(response.writeHead).toBeCalledWith(302, {
            Location: '/test',
        });
        expect(response.end).toBeCalled();
        const response2 = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        const router2 = new liveRouter_1.LiveRouter(response2, 'client-router');
        router2.redirect('/test');
        expect(response2.setHeader).toBeCalledWith('x-router-action', 'redirect');
        expect(response2.setHeader).toBeCalledWith('x-router-path', '/test');
        const assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        const resolver = jest.fn();
        const response3 = new utils_1.PondResponse({}, assigns, resolver);
        const router3 = new liveRouter_1.LiveRouter(response3);
        router3.redirect('/test');
        expect(resolver).toBeCalled();
    });
    it('should be capable of pushing', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        const router = new liveRouter_1.LiveRouter(response);
        router.push('/test');
        expect(response.writeHead).toBeCalledWith(302, {
            Location: '/test',
        });
        expect(response.end).toBeCalled();
        const response2 = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        const router2 = new liveRouter_1.LiveRouter(response2, 'client-router');
        router2.push('/test');
        expect(response2.setHeader).toBeCalledWith('x-router-action', 'push');
        expect(response2.setHeader).toBeCalledWith('x-router-path', '/test');
        const assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        const resolver = jest.fn();
        const response3 = new utils_1.PondResponse({}, assigns, resolver);
        const router3 = new liveRouter_1.LiveRouter(response3);
        router3.push('/test');
        expect(resolver).toBeCalled();
    });
    it('should be capable of replacing', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        const router = new liveRouter_1.LiveRouter(response);
        router.replace('/test');
        expect(response.writeHead).toBeCalledWith(302, {
            Location: '/test',
        });
        expect(response.end).toBeCalled();
        const response2 = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        const router2 = new liveRouter_1.LiveRouter(response2, 'client-router');
        router2.replace('/test');
        expect(response2.setHeader).toBeCalledWith('x-router-action', 'replace');
        expect(response2.setHeader).toBeCalledWith('x-router-path', '/test');
        const assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        const resolver = jest.fn();
        const response3 = new utils_1.PondResponse({}, assigns, resolver);
        const router3 = new liveRouter_1.LiveRouter(response3);
        router3.replace('/test');
        expect(resolver).toBeCalled();
    });
    it('should fail to perform multiple actions since a response is sent', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        const router = new liveRouter_1.LiveRouter(response);
        router.redirect('/test');
        expect(router.sentResponse).toBe(true);
        expect(() => router.redirect('/test')).toThrow();
        const response2 = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        const router2 = new liveRouter_1.LiveRouter(response2, 'client-router');
        router2.redirect('/test');
        expect(router2.sentResponse).toBe(true);
        expect(() => router2.redirect('/test')).toThrow();
        const assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        const resolver = jest.fn();
        const response3 = new utils_1.PondResponse({}, assigns, resolver);
        const router3 = new liveRouter_1.LiveRouter(response3);
        router3.redirect('/test');
        expect(router3.sentResponse).toBe(true);
        expect(() => router3.redirect('/test')).toThrow();
    });
});
