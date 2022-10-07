import {IncomingHttpHeaders, ServerResponse} from "http";

function parseCookies (headers: IncomingHttpHeaders) {
    const list: Record<string, string> = {};
    const cookieHeader = headers?.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function(cookie) {
        let [ name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });

    return list;
}

function setCookie(res: ServerResponse, name: string, value: string, options: any = {}) {
    options = {
        path: '/',
        ...options
    };

    if (options.maxAge) {
        options.expires = new Date(Date.now() + options.maxAge);
        options.maxAge /= 1000;
    }

    if (options.expires) {
        options.expires = options.expires.toUTCString();
    }

    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }

    res.setHeader("Set-Cookie", updatedCookie);
}

function deleteCookie(res: ServerResponse, name: string) {
    setCookie(res, name, "", {
        'max-age': -1
    });
}

export {parseCookies, setCookie, deleteCookie};
