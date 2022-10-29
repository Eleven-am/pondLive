"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authoriseUploader = void 0;
const baseClass_1 = require("../../utils/baseClass");
/**
 * @desc A function that authorizes upload requests
 * @param authorizer - a function that authorizes the request
 */
const authoriseUploader = (authorizer) => (req) => {
    const { clientId, setToken } = authorizer(req.headers);
    if (setToken || !clientId)
        return { valid: false, clientId: '' };
    const csrfToken = req.headers['x-csrf-token'];
    if (csrfToken === undefined)
        return { valid: false, clientId: '' };
    const base = new baseClass_1.BaseClass();
    const tokenObject = base.decrypt(clientId, csrfToken);
    if (!tokenObject)
        return { valid: false, clientId: '' };
    const valid = Date.now() - tokenObject.timestamp <= 1000 * 60 * 60 * 2;
    return { valid, clientId: clientId };
};
exports.authoriseUploader = authoriseUploader;
