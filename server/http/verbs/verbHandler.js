"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerbHandler = void 0;
const VerbHandler = (chain, path, method, handler) => {
    chain.use((req, res, next) => {
        if (method === req.method) {
            const resolver = chain.generateEventRequest(path, req.url || '');
            if (resolver) {
                const newReq = { ...req, ...resolver };
                handler(newReq, res, next);
            }
            else
                next();
        }
        else
            next();
    });
};
exports.VerbHandler = VerbHandler;
