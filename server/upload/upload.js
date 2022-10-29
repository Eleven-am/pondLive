"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateUploader = void 0;
const busboy_1 = require("./busboy");
/**
 * @desc A middleware function that handles file uploads
 * @param validator - a function that validates the request
 * @param broadcaster - a broadcaster that broadcasts the upload events
 * @returns a middleware function
 */
const GenerateUploader = (validator, broadcaster) => (req, res) => {
    const { valid, clientId } = validator(req);
    const router = req.headers['x-router-path'];
    const event = req.headers['x-router-event'];
    if (!valid)
        return res.status(401).json({ error: 'Unauthorized' });
    if (!router || !event)
        return res.status(400).json({ error: 'Bad Request' });
    return (0, busboy_1.busBoyManager)(req, res, {
        broadcaster, event,
        componentId: router,
        clientId: clientId,
    });
};
exports.GenerateUploader = GenerateUploader;
