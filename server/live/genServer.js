"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateLiveServer = void 0;
const http_1 = require("../http");
const pondSocket_1 = require("../socket/pondSocket");
const utils_1 = require("../utils");
const componentManager_1 = require("./componentManager");
const path_1 = __importDefault(require("path"));
const GenerateLiveServer = (routes, server, chain, props) => {
    const pondServer = props?.pondSocket ?? new pondSocket_1.PondSocket(server);
    const base = new utils_1.BaseClass();
    const secret = props?.secret || base.uuid();
    const cookieName = props?.cookie || 'pondLive';
    const pondPath = props?.pondPath || '';
    const pondId = base.nanoId();
    const handler = (0, http_1.FileRouter)(path_1.default.join(__dirname, './client/'));
    const authenticator = (0, http_1.AuthenticateRequest)(secret, cookieName);
    const socketAuthenticator = (0, http_1.AuthenticateUpgrade)(secret, cookieName);
    pondServer.useOnUpgrade(socketAuthenticator);
    chain.use(authenticator);
    chain.use(handler);
    const endpoint = pondServer.createEndpoint('/live', (req, res) => {
        let token = (0, http_1.parseCookies)(req.headers)[cookieName] || '';
        let clientId = base.decrypt(secret, token)?.time || null;
        if (clientId && Date.now() - parseInt(clientId) < 1000 * 60 * 60 * 2)
            return res.accept({
                assigns: { token, clientId },
            });
        res.reject('Unauthorized');
    });
    const channel = endpoint.createChannel('/live/:token', (req, res) => {
        if (req.params.token === req.clientAssigns.token)
            res.accept();
        else
            res.reject('Unauthorized', 401);
    });
    const managerProps = {
        pond: channel,
        htmlPath: props?.htmlPath,
        chain, parentId: pondId
    };
    routes.map(route => {
        const path = `${pondPath}${route.path}`;
        return new componentManager_1.ComponentManager(path, new route.Component(), managerProps);
    });
    return pondServer;
};
exports.GenerateLiveServer = GenerateLiveServer;
