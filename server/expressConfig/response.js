"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyResponse = void 0;
const setCookieGenerator = (response) => {
    response.setCookie = (name, value, options = {}) => {
        let cookie = `${name}=${value}`;
        if (options) {
            if (options.path)
                cookie += `; Path=${options.path}`;
            if (options.domain)
                cookie += `; Domain=${options.domain}`;
            if (options.secure)
                cookie += `; Secure`;
            if (options.httpOnly)
                cookie += `; HttpOnly`;
            if (options.expires)
                cookie += `; Expires=${options.expires.toUTCString()}`;
            if (options.maxAge !== undefined)
                cookie += `; Max-Age=${options.maxAge}`;
            if (options.sameSite)
                cookie += `; SameSite=${options.sameSite}`;
        }
        response.setHeader('Set-Cookie', cookie);
    };
    return response;
};
const HTMLResponse = (response) => {
    response.html = (html) => {
        response.setHeader('Content-Type', 'text/html');
        response.write(html);
        response.end();
    };
    return response;
};
const applyResponse = (response) => {
    return HTMLResponse(setCookieGenerator(response));
};
exports.applyResponse = applyResponse;
