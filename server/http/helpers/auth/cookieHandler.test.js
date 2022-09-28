"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cookieHandler_1 = require("./cookieHandler");
describe('cookieHandler', function () {
    it('should return a cookie with the correct name', function () {
        var cookie = (0, cookieHandler_1.parseCookies)({ cookie: 'name=John' });
        expect(cookie.name).toBe('John');
    });
    it('should fail to return a cookie with the incorrect name', function () {
        var cookie = (0, cookieHandler_1.parseCookies)({ cookie: 'name=John' });
        expect(cookie.name).not.toBe('Johny');
    });
    it('should be able to write a cookie', function () {
        var res = {
            setHeader: jest.fn()
        };
        (0, cookieHandler_1.setCookie)(res, 'name', 'John');
        expect(res.setHeader).toBeCalledWith('Set-Cookie', 'name=John; path=/');
    });
    it('should be able to write a cookie with options', function () {
        var res = {
            setHeader: jest.fn()
        };
        (0, cookieHandler_1.setCookie)(res, 'name', 'John', { maxAge: 1000, httpOnly: true });
        var s = "name=John; path=/; maxAge=1; httpOnly; expires=" + new Date(Date.now() + 1000).toUTCString();
        expect(res.setHeader).toBeCalledWith('Set-Cookie', s);
    });
    it('should be capable of deleting a cookie', function () {
        var res = {
            setHeader: jest.fn()
        };
        (0, cookieHandler_1.deleteCookie)(res, 'name');
        expect(res.setHeader).toBeCalledWith('Set-Cookie', 'name=; path=/; max-age=-1');
    });
});
