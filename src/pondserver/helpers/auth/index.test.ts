import * as index from './index';

describe('Index', () => {
    it('should export the correct functions', () => {
        expect(Object.keys(index)).toEqual([
            "parseCookies",
            "setCookie",
            "deleteCookie",
            "AuthenticateRequest",
            "AuthenticateUpgrade",
        ]);
    });
});
