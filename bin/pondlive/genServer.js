"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateLiveServer = void 0;
var pondserver_1 = require("../pondserver");
var pondsocket_1 = require("../pondsocket");
var pondbase_1 = require("../pondbase");
var componentManager_1 = require("./componentManager");
var pondLiveChannel_1 = require("./component/pondLiveChannel");
var GenerateLiveServer = function (routes, server, chain, props) {
    var _a;
    var pondServer = (_a = props === null || props === void 0 ? void 0 : props.pondSocket) !== null && _a !== void 0 ? _a : new pondsocket_1.PondSocket(server);
    var base = new pondbase_1.BaseClass();
    var secret = (props === null || props === void 0 ? void 0 : props.secret) || base.uuid();
    var cookieName = (props === null || props === void 0 ? void 0 : props.cookie) || 'pondLive';
    var pondPath = (props === null || props === void 0 ? void 0 : props.pondPath) || '';
    var pondId = base.nanoId();
    // const handler = FileRouter(path.join(__dirname, './client/'));
    var authenticator = (0, pondserver_1.AuthenticateRequest)(secret, cookieName);
    var socketAuthenticator = (0, pondserver_1.AuthenticateUpgrade)(secret, cookieName);
    pondServer.useOnUpgrade(socketAuthenticator);
    chain.use(authenticator);
    // chain.use(handler);
    var endpoint = pondServer.createEndpoint('/live', function (req, res) {
        var _a;
        var token = (0, pondserver_1.parseCookies)(req.headers)[cookieName] || '';
        var clientId = ((_a = base.decrypt(secret, token)) === null || _a === void 0 ? void 0 : _a.time) || null;
        if (clientId && Date.now() - parseInt(clientId) < 1000 * 60 * 60 * 2) {
            var newToken = {
                token: base.uuid(),
                clientId: clientId,
                timestamp: Date.now()
            };
            var csrfToken = base.encrypt(secret, newToken);
            return res.send('token', { csrfToken: csrfToken }, {
                assigns: {
                    csrfToken: csrfToken,
                    clientId: clientId
                },
            });
        }
        res.reject('Unauthorized');
    });
    var channel = endpoint.createChannel('/live', function (req, res) {
        if (req.joinParams.clientId === req.clientAssigns.csrfToken)
            res.accept();
        else
            res.reject('Unauthorized', 401);
    });
    var managerProps = {
        pond: channel,
        htmlPath: props === null || props === void 0 ? void 0 : props.htmlPath,
        chain: chain,
        parentId: pondId,
        secret: secret,
        providers: (props === null || props === void 0 ? void 0 : props.providers) || [],
        pondLive: new pondLiveChannel_1.PondLiveChannelManager(),
    };
    routes.map(function (route) {
        var path = "".concat(pondPath).concat(route.path);
        return new componentManager_1.ComponentManager(path, new route.Component(), managerProps);
    });
    var manager = managerProps.pondLive;
    return { pondServer: pondServer, manager: manager };
};
exports.GenerateLiveServer = GenerateLiveServer;
