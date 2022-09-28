"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateLiveServer = void 0;
var server_1 = require("../socket/server");
var baseClass_1 = require("../utils/baseClass");
var auth_1 = require("../http/helpers/auth");
var componentManager_1 = require("./componentManager");
var fileRouter_1 = require("../http/helpers/server/fileRouter");
var path_1 = __importDefault(require("path"));
var GenerateLiveServer = function (routes, server, chain, props) {
    var _a;
    var pondServer = (_a = props === null || props === void 0 ? void 0 : props.pondSocket) !== null && _a !== void 0 ? _a : new server_1.Server(server);
    var base = new baseClass_1.BaseClass();
    var secret = (props === null || props === void 0 ? void 0 : props.secret) || base.uuid();
    var cookieName = (props === null || props === void 0 ? void 0 : props.cookie) || 'pondLive';
    var pondPath = (props === null || props === void 0 ? void 0 : props.pondPath) || '';
    var pondId = base.nanoId();
    var handler = (0, fileRouter_1.FileRouter)(path_1.default.join(__dirname, './client/'));
    var authenticator = (0, auth_1.AuthenticateRequest)(secret, cookieName);
    var socketAuthenticator = (0, auth_1.AuthenticateUpgrade)(secret, cookieName);
    pondServer.useOnUpgrade(socketAuthenticator);
    chain.use(authenticator);
    chain.use(handler);
    var endpoint = pondServer.createEndpoint('/live', function (req, res) {
        var _a;
        var token = (0, auth_1.parseCookies)(req.headers)[cookieName] || '';
        var clientId = ((_a = base.decrypt(secret, token)) === null || _a === void 0 ? void 0 : _a.time) || null;
        if (clientId && Date.now() - parseInt(clientId) < 1000 * 60 * 60 * 2)
            return res.accept({
                assigns: { token: token, clientId: clientId },
            });
        res.reject('Unauthorized');
    });
    var channel = endpoint.createChannel('/live/:token', function (req, res) {
        if (req.params.token === req.clientAssigns.token)
            res.accept();
        else
            res.reject('Unauthorized', 401);
    });
    var managerProps = {
        pond: channel,
        htmlPath: props === null || props === void 0 ? void 0 : props.htmlPath,
        chain: chain,
        parentId: pondId
    };
    routes.map(function (route) {
        var path = "" + pondPath + route.path;
        return new componentManager_1.ComponentManager(path, new route.Component(), managerProps);
    });
    return pondServer;
};
exports.GenerateLiveServer = GenerateLiveServer;
