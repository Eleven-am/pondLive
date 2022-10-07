import {Server} from "http";
import {AuthenticateRequest, AuthenticateUpgrade, Chain, FileRouter, parseCookies} from "../pondserver";
import {PondSocket as PondServer} from "../pondsocket";
import {BaseClass} from "../pondbase";
import {Route} from "./component/liveComponent";
import {ComponentManager, IComponentManagerProps} from "./componentManager";
import {PondLiveChannelManager} from "./component/pondLiveChannel";
import path from "path";
import {ContextProvider} from "./contextManager";

interface ServerProps {
    secret?: string;
    cookie?: string;
    pondPath?: string;
    pondSocket?: PondServer;
    htmlPath?: string;
    providers?: ContextProvider[];
}

export const GenerateLiveServer = (routes: Route[], server: Server, chain: Chain, props?: ServerProps) => {
    const pondServer = props?.pondSocket ?? new PondServer(server);
    const base = new BaseClass();
    const secret = props?.secret || base.uuid();
    const cookieName = props?.cookie || 'pondLive';
    const pondPath = props?.pondPath || '';
    const pondId = base.nanoId();

    const handler = FileRouter(path.join(__dirname, './client/'));
    const authenticator = AuthenticateRequest(secret, cookieName);
    const socketAuthenticator = AuthenticateUpgrade(secret, cookieName);
    pondServer.useOnUpgrade(socketAuthenticator);
    chain.use(authenticator);
    chain.use(handler);

    const endpoint = pondServer.createEndpoint('/live', (req, res) => {
        let token = parseCookies(req.headers)[cookieName] || '';
        let clientId = base.decrypt<{ time: string }>(secret, token)?.time || null;

        if (clientId && Date.now() - parseInt(clientId) < 1000 * 60 * 60 * 2)
            return res.accept({
                assigns: {token, clientId},
            });

        res.reject('Unauthorized');
    });

    const channel = endpoint.createChannel('/live/:token', (req, res) => {
        if (req.params.token === req.clientAssigns.token)
            res.accept();
        else
            res.reject('Unauthorized', 401);
    });

    const managerProps: IComponentManagerProps = {
        pond: channel,
        htmlPath: props?.htmlPath,
        chain, parentId: pondId,
        providers: props?.providers || [],
        pondLive: new PondLiveChannelManager(),
    }

    routes.map(route => {
        const path = `${pondPath}${route.path}`;
        return new ComponentManager(path, new route.Component(), managerProps);
    });

    const manager = managerProps.pondLive;
    return {pondServer, manager};
}
