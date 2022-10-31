"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const liveRouter_1 = require("./liveRouter");
const pondResponse_1 = require("../utils/pondResponse");
const createRouter = (response, type) => {
    const bank = new Map();
    const router = new liveRouter_1.LiveRouter(response, '/', bank, type);
    return { router, bank };
};
describe('liveRouter', () => {
    it('should create a router from a pond response', () => {
        const resolver = jest.fn();
        const response = new pondResponse_1.PondResponse({ send: resolver });
        const router = createRouter(response);
        expect(router).toBeTruthy();
    });
    it('should create a router from a http server response', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        const router = createRouter(response);
        expect(router).toBeTruthy();
    });
    it('should create a router from a http client response', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        const router = createRouter(response);
        expect(router).toBeTruthy();
    });
    it('should be able to set the page title', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        const { router } = createRouter(response);
        router.pageTitle = 'test';
        expect(router.headers.pageTitle).toBe('test');
    });
    it('should be able to set the flash message', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        const { router } = createRouter(response);
        router.flashMessage = 'test';
        expect(router.headers.flashMessage).toBe('test');
    });
    it('should be capable of returning a the router headers', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        const { router } = createRouter(response);
        router.pageTitle = 'test';
        router.flashMessage = 'test';
        expect(router.headers).toEqual({
            pageTitle: 'test',
            flashMessage: 'test',
        });
    });
    it('should be capable of redirecting', () => {
        const response = {
            redirect: jest.fn(),
        };
        const { router } = createRouter(response);
        router.navigateTo('/test');
        expect(response.redirect).toBeCalledWith('/test');
        const response2 = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        const { router: router2 } = createRouter(response2, 'client-router');
        router2.navigateTo('/test');
        expect(response2.setHeader).toBeCalledWith('x-router-action', 'redirect');
        expect(response2.setHeader).toBeCalledWith('x-router-path', '/test');
        const resolver = jest.fn();
        const response3 = new pondResponse_1.PondResponse({ broadcast: resolver });
        const { router: router3 } = createRouter(response3);
        router3.navigateTo('/test');
        expect(resolver).toBeCalled();
    });
    it('should be capable of replacing', () => {
        const response = {
            redirect: jest.fn(),
        };
        const { router } = createRouter(response);
        router.replace('/test');
        expect(response.redirect).toBeCalledWith('/test');
        const response2 = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        const { router: router2 } = createRouter(response2, 'client-router');
        router2.replace('/test');
        expect(response2.setHeader).toBeCalledWith('x-router-action', 'replace');
        expect(response2.setHeader).toBeCalledWith('x-router-path', '/test');
        const resolver = jest.fn();
        const response3 = new pondResponse_1.PondResponse({ broadcast: resolver });
        const { router: router3 } = createRouter(response3);
        router3.replace('/test');
        expect(resolver).toBeCalled();
    });
    it('should be capable of reloading', () => {
        const response = {
            redirect: jest.fn(),
        };
        const { router } = createRouter(response);
        router.reload();
        expect(response.redirect).not.toBeCalled();
        const response2 = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        const { router: router2 } = createRouter(response2, 'client-router');
        router2.reload();
        expect(response2.setHeader).not.toBeCalled();
        const resolver = jest.fn();
        const response3 = new pondResponse_1.PondResponse({ broadcast: resolver });
        const { router: router3 } = createRouter(response3);
        router3.reload();
        expect(resolver).toBeCalled();
    });
    it('should fail to perform multiple actions since a response is sent', () => {
        const response = {
            redirect: jest.fn(),
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        const { router } = createRouter(response);
        router.navigateTo('/test');
        expect(router.sentResponse).toBe(true);
        expect(() => router.navigateTo('/test')).toThrow();
        const response2 = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        const { router: router2 } = createRouter(response2, 'client-router');
        router2.navigateTo('/test');
        expect(router2.sentResponse).toBe(true);
        expect(() => router2.navigateTo('/test')).toThrow();
        const resolver = jest.fn();
        const response3 = new pondResponse_1.PondResponse({ broadcast: resolver });
        const { router: router3 } = createRouter(response3);
        router3.navigateTo('/test');
        expect(router3.sentResponse).toBe(true);
        expect(() => router3.navigateTo('/test')).toThrow();
    });
    it('should be able to set a cookie', () => {
        const response = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            setCookie: jest.fn(),
            end: jest.fn(),
        };
        const { router } = createRouter(response);
        router.setCookie('test', 'test');
        expect(response.setCookie).toBeCalledWith('test', 'test', {});
        const response2 = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            setCookie: jest.fn(),
        };
        const { router: router2 } = createRouter(response2, 'client-router');
        router2.setCookie('test', 'test');
        expect(response2.setCookie).toBeCalledWith('test', 'test', {});
        let outerData;
        const resolver = (event, data) => {
            expect(event).toBe('router');
            expect(data.action).toEqual('set-cookie');
            expect(data.cookiePath).toEqual('/');
            expect(data.data).toBeDefined();
            outerData = data.data;
        };
        const response3 = new pondResponse_1.PondResponse({ broadcast: resolver });
        const { router: router3, bank } = createRouter(response3);
        router3.setCookie('test', 'test');
        expect(outerData).toBeDefined();
        expect(bank.get(outerData)).toEqual({
            name: 'test',
            value: 'test',
            options: {},
        });
    });
});
