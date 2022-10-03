"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateLiveServer = void 0;
var http_1 = require("../http");
var pondSocket_1 = require("../socket/pondSocket");
var utils_1 = require("../utils");
var componentManager_1 = require("./componentManager");
var pondLiveChannel_1 = require("./component/pondLiveChannel");
var GenerateLiveServer = function (routes, server, chain, props) {
    var _a;
    var pondServer = (_a = props === null || props === void 0 ? void 0 : props.pondSocket) !== null && _a !== void 0 ? _a : new pondSocket_1.PondSocket(server);
    var base = new utils_1.BaseClass();
    var secret = (props === null || props === void 0 ? void 0 : props.secret) || base.uuid();
    var cookieName = (props === null || props === void 0 ? void 0 : props.cookie) || 'pondLive';
    var pondPath = (props === null || props === void 0 ? void 0 : props.pondPath) || '';
    var pondId = base.nanoId();
    // const handler = FileRouter(path.join(__dirname, './client/'));
    var authenticator = (0, http_1.AuthenticateRequest)(secret, cookieName);
    var socketAuthenticator = (0, http_1.AuthenticateUpgrade)(secret, cookieName);
    pondServer.useOnUpgrade(socketAuthenticator);
    chain.use(authenticator);
    // chain.use(handler);
    var endpoint = pondServer.createEndpoint('/live', function (req, res) {
        var _a;
        var token = (0, http_1.parseCookies)(req.headers)[cookieName] || '';
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
        parentId: pondId,
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
