import {LiveRouter} from "./liveRouter";
import { PondResponse } from "../../pondsocket";

describe('liveRouter', () => {
    it('should create a router from a pond response', () => {
        const resolver = jest.fn()

        const assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        }

        const response = new PondResponse({}, assigns, resolver);
        const router = new LiveRouter(response);
        expect(router).toBeTruthy();
    });

    it('should create a router from a http server response', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        } as any;
        const router = new LiveRouter(response);
        expect(router).toBeTruthy();
    });

    it('should create a router from a http client response', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        } as any;
        const router = new LiveRouter(response, 'client-router');
        expect(router).toBeTruthy();
    });

    it('should be able to set the page title', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        } as any;
        const router = new LiveRouter(response);
        router.pageTitle = 'test';
        expect(router.headers.pageTitle).toBe('test');
    });

    it('should be able to set the flash message', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        } as any;
        const router = new LiveRouter(response);
        router.flashMessage = 'test';
        expect(router.headers.flashMessage).toBe('test');
    });

    it('should be capable of returning a the router headers', () => {
        const response = {
            writeHead: jest.fn(),
            end: jest.fn(),
        } as any;
        const router = new LiveRouter(response);
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
        } as any;
        const router = new LiveRouter(response);
        router.navigateTo('/test');
        expect(response.redirect).toBeCalledWith('/test');

        const response2 = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        } as any;

        const router2 = new LiveRouter(response2, 'client-router');

        router2.navigateTo('/test');
        expect(response2.setHeader).toBeCalledWith('x-router-action', 'redirect');
        expect(response2.setHeader).toBeCalledWith('x-router-path', '/test');

        const assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        }

        const resolver = jest.fn();

        const response3 = new PondResponse({}, assigns, resolver);
        const router3 = new LiveRouter(response3);
        router3.navigateTo('/test');

        expect(resolver).toBeCalled();
    });

    it('should be capable of replacing', () => {
        const response = {
            redirect: jest.fn(),
        } as any;
        const router = new LiveRouter(response);
        router.replace('/test');
        expect(response.redirect).toBeCalledWith( '/test');

        const response2 = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        } as any;

        const router2 = new LiveRouter(response2, 'client-router');

        router2.replace('/test');
        expect(response2.setHeader).toBeCalledWith('x-router-action', 'replace');
        expect(response2.setHeader).toBeCalledWith('x-router-path', '/test');

        const assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        }

        const resolver = jest.fn();

        const response3 = new PondResponse({}, assigns, resolver);
        const router3 = new LiveRouter(response3);
        router3.replace('/test');

        expect(resolver).toBeCalled();
    });

    it('should fail to perform multiple actions since a response is sent', () => {
        const response = {
            redirect: jest.fn(),
            writeHead: jest.fn(),
            end: jest.fn(),
        } as any;
        const router = new LiveRouter(response);
        router.navigateTo('/test');
        expect(router.sentResponse).toBe(true);
        expect(() => router.navigateTo('/test')).toThrow();

        const response2 = {
            writeHead: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        } as any;

        const router2 = new LiveRouter(response2, 'client-router');
        router2.navigateTo('/test');
        expect(router2.sentResponse).toBe(true);
        expect(() => router2.navigateTo('/test')).toThrow();

        const assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        }

        const resolver = jest.fn();
        const response3 = new PondResponse({}, assigns, resolver);

        const router3 = new LiveRouter(response3);
        router3.navigateTo('/test');
        expect(router3.sentResponse).toBe(true);
        expect(() => router3.navigateTo('/test')).toThrow();
    });
});
