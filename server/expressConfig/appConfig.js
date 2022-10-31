"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondLive = exports.fileExist = void 0;
const express_1 = __importDefault(require("express"));
const authenticate_1 = require("../auth/authenticate");
const http_1 = require("http");
const component_1 = require("../../component");
const upload_1 = require("../upload");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pondsocket_1 = require("@eleven-am/pondsocket");
const base_1 = require("@eleven-am/pondsocket/base");
const baseClass_1 = require("../../utils/baseClass");
const fileExist = (filePath) => {
    try {
        return fs_1.default.existsSync(filePath) && !fs_1.default.lstatSync(filePath).isDirectory();
    }
    catch (err) {
        return false;
    }
};
exports.fileExist = fileExist;
/**
 * @desc Creates a pond live server
 * @param app - The Express app to be used by the server
 * @constructor
 */
const PondLive = (app) => {
    const server = (0, http_1.createServer)(app);
    const pondSocket = new pondsocket_1.PondSocket(server);
    const base = new baseClass_1.BaseClass();
    const broadcaster = new base_1.Broadcast();
    app.usePondLive = (routes, options) => {
        const cookieBank = new Map();
        const cookieName = (options === null || options === void 0 ? void 0 : options.cookie) || 'pondLive';
        const staticPath = (options === null || options === void 0 ? void 0 : options.staticPath) || '';
        const secret = (options === null || options === void 0 ? void 0 : options.secret) || base.uuid();
        const pondPath = (options === null || options === void 0 ? void 0 : options.pondPath) || '';
        const uploadPath = (options === null || options === void 0 ? void 0 : options.uploadPath) || '/pondLive/uploads';
        const providers = (options === null || options === void 0 ? void 0 : options.providers) || [];
        const pondId = base.nanoId();
        const cookiePath = `/${base.uuid()}/`;
        let htmlPath = undefined;
        const authenticator = (0, authenticate_1.AuthorizeRequest)(secret, cookieName, options === null || options === void 0 ? void 0 : options.authenticator);
        const socketAuthenticator = (0, authenticate_1.AuthorizeUpgrade)(secret, cookieName, options === null || options === void 0 ? void 0 : options.authenticator);
        const validator = (0, upload_1.authoriseUploader)((0, authenticate_1.getAuthorizer)(secret, cookieName, options === null || options === void 0 ? void 0 : options.authenticator));
        const uploader = (0, upload_1.GenerateUploader)(validator, broadcaster);
        const cookieSigner = (0, authenticate_1.LiveRouterCookieSigner)(cookieBank);
        app.use(authenticator);
        app.post(uploadPath, uploader);
        app.get(`${cookiePath}:cookieId`, cookieSigner);
        app.use(express_1.default.static(path_1.default.join(__dirname, '../../client')));
        if (staticPath) {
            const exists = (0, exports.fileExist)(`${options.staticPath}/index.html`);
            if (exists)
                htmlPath = `${options.staticPath}/index.html`;
        }
        const endpoint = pondSocket.createEndpoint('/live', (req, res) => {
            return socketAuthenticator(req, res);
        });
        const channel = endpoint.createChannel('/:nanoId', (req, res) => {
            if (req.joinParams.clientId === req.clientAssigns.csrfToken && req.params.nanoId === req.clientAssigns.nanoId)
                res.accept();
            else
                res.reject('Unauthorized', 4001);
        });
        const managerProps = {
            pond: channel,
            htmlPath: htmlPath,
            chain: app, secret,
            parentId: pondId,
            internalBus: broadcaster,
            providers: providers,
            uploadPath: uploadPath,
            cookieBank: cookieBank,
            cookiePath: cookiePath,
        };
        routes.map(route => {
            const path = `${pondPath}${route.path}`;
            return new component_1.ComponentManager(path, new route.Component(), managerProps);
        });
        app.use(express_1.default.static(staticPath));
    };
    app.upgrade = (path, handler) => {
        return pondSocket.createEndpoint(path, handler);
    };
    app.listen = (...args) => {
        return server.listen(...args);
    };
    return app;
};
exports.PondLive = PondLive;
