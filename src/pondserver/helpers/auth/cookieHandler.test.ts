import {deleteCookie, parseCookies, setCookie} from "./cookieHandler";

describe('cookieHandler', () => {
    it('should return a cookie with the correct name', () => {
        const cookie = parseCookies({cookie: 'name=John'});
        expect(cookie.name).toBe('John');
    });

    it('should fail to return a cookie with the incorrect name', () => {
        const cookie = parseCookies({cookie: 'name=John'});
        expect(cookie.name).not.toBe('Johny');
    })

    it('should be able to write a cookie', () => {
        const res = {
            setHeader: jest.fn()
        } as any;

        setCookie(res, 'name', 'John');

        expect(res.setHeader).toBeCalledWith('Set-Cookie', 'name=John; path=/');
    })

    it('should be able to write a cookie with options', () => {
        const res = {
            setHeader: jest.fn()
        } as any;

        setCookie(res, 'name', 'John', {maxAge: 1000, httpOnly: true});
        const s = `name=John; path=/; maxAge=1; httpOnly; expires=${new Date(Date.now() + 1000).toUTCString()}`;

        expect(res.setHeader).toBeCalledWith('Set-Cookie', s);
    })

    it('should be capable of deleting a cookie', () => {
        const res = {
            setHeader: jest.fn()
        } as any;

        deleteCookie(res, 'name');

        expect(res.setHeader).toBeCalledWith('Set-Cookie', 'name=; path=/; max-age=-1');
    })
});
