import type { Client, JoinResponse } from '@eleven-am/pondsocket/types';

import { Route } from './liveContext';
import { Manager } from './manager';
import { isEmpty, sortBy, uuidV4 } from '../helpers/helpers';
import { Html } from '../parser/parser';
import { Request } from '../wrappers/request';
import { Response, CookieOptions, createSetCookieHeader } from '../wrappers/response';
import { ServerEvent } from '../wrappers/serverEvent';


export enum PondLiveHeaders {
    LIVE_USER_ID = 'x-pond-live-user-id',
    LIVE_ROUTER = 'x-pond-live-router',
    LIVE_PAGE_TITLE = 'x-pond-live-page-title',
    LIVE_ROUTER_ACTION = 'x-pond-live-router-action',
}

export enum PondLiveActions {
    LIVE_ROUTER_NAVIGATE = 'navigate',
    LIVE_ROUTER_UPDATE = 'update',
    LIVE_ROUTER_RELOAD = 'reload',
    LIVE_ROUTER_GET_COOKIE = 'get-cookie',
}

interface ClientData {
    address: string;
    channel: Client;
    virtualDom: Html;
}

export interface UpdateData {
    diff: Record<string, any> | null;
    [PondLiveHeaders.LIVE_ROUTER_ACTION]?: PondLiveActions;
    [PondLiveHeaders.LIVE_PAGE_TITLE]?: string;
    address?: string;
}

export class Context {
    #clients: Map<string, ClientData>;

    #managers: Manager[];

    #entryManagers: Manager[];

    #upgrading: Map<string, Html>;

    #dynamicRoutes: Map<string, string>;

    constructor () {
        this.#clients = new Map();
        this.#upgrading = new Map();
        this.#dynamicRoutes = new Map();
        this.#entryManagers = [];
        this.#managers = [];
    }

    initRoute (route: Route) {
        const absolutePath = `/${route.path}`.replace(/\/+/g, '/');
        let manager = this.#managers.find((m) => m.path === absolutePath);

        if (manager) {
            throw new Error(`Route ${absolutePath} already exists`);
        }

        manager = new Manager(this, route.component, absolutePath);

        manager.render('*', 'server');
        manager.doneBuilding();

        this.#managers.push(manager);

        return manager;
    }

    performAction (event: ServerEvent) {
        return Promise.all(this.#managers.map((manager) => manager.performAction(event)));
    }

    upgradeUserOnJoin (userId: string, channel: Client, response: JoinResponse, address: string, pondSocketId: string) {
        const html = this.#upgrading.get(userId);
        const event = new ServerEvent(userId, channel, this, {
            address,
            action: 'upgrade',
            value: null,
            dataId: null,
        });


        if (!html) {
            response.accept();
            event.reloadPage();

            channel.banUser(pondSocketId, 'No upgrade available');

            return;
        }

        response.accept({
            userId,
        });

        const client: ClientData = {
            channel,
            address,
            virtualDom: html,
        };

        this.#clients.set(userId, client);
        this.#upgrading.delete(userId);

        return this.upgradeUser(event);
    }

    mountUser (req: Request, res: Response) {
        const managersToMount = this.#managers.filter((manager) => req.matches(manager.path));
        const promises = managersToMount.map((manager) => manager.mount(req, res));

        return Promise.all(promises);
    }

    addEntryManager (manager: Manager) {
        this.#entryManagers.push(manager);
    }

    reload (userId: string) {
        const client = this.#clients.get(userId);

        if (!client) {
            return;
        }

        const event = new ServerEvent(userId, client.channel, this, {
            address: client.address,
            action: 'reload',
            value: null,
            dataId: null,
        });

        const manager = this.#entryManagers.find((m) => m.canRender(event.path));

        if (!manager) {
            return;
        }

        const html = manager.render(event.path, userId);
        const diff = client.virtualDom.differentiate(html);

        if (isEmpty(diff)) {
            return;
        }

        event.sendDiff(diff);

        client.virtualDom = html;
    }

    fromPath (path: string, userId: string) {
        const managers = sortBy(this.#managers, 'path', 'desc');
        const manager = managers.find((m) => m.canRender(path));

        if (!manager) {
            throw new Error(`No manager found for path ${path}`);
        }

        return manager.createContext(path, userId);
    }

    addUpgradingUser (userId: string, html: Html) {
        this.#upgrading.set(userId, html);
    }

    getClient (userId: string) {
        return this.#clients.get(userId);
    }

    upgradeUser (event: ServerEvent) {
        const managersToMount = this.#managers.filter((manager) => event.matches(manager.path));
        const promises = managersToMount.map((manager) => manager.upgrade(event));

        event.action = 'unmount';
        const managersToUnmount = this.#managers.filter((manager) => !event.matches(manager.path));
        const unmountPromises = managersToUnmount.map((manager) => manager.unmount(event));

        return Promise.all([...promises, ...unmountPromises]);
    }

    unmountUser (userId: string) {
        const client = this.#clients.get(userId);

        if (!client) {
            return;
        }

        const event = new ServerEvent(userId, client.channel, this, {
            address: client.address,
            action: 'unmount',
            value: null,
            dataId: null,
        });

        const promises = this.#managers.map((manager) => manager.unmount(event));

        return Promise.all(promises);
    }

    addUploadPath (moveTo: string): string {
        const uploadPath = uuidV4();
        const pathWithToken = `/upload/${uploadPath}`;

        this.#dynamicRoutes.set(pathWithToken, moveTo);

        return pathWithToken;
    }

    addCookiePath (name: string, value: string, options: CookieOptions = {}): string {
        const cookieHeader = {
            'Set-Cookie': createSetCookieHeader(name, value, options),
        };

        const pathWithToken = `/cookie/${uuidV4()}`;

        this.#dynamicRoutes.set(pathWithToken, JSON.stringify(cookieHeader));

        return pathWithToken;
    }

    getUploadPath (uploadPath: string): string | undefined {
        const data = this.#dynamicRoutes.get(uploadPath);

        this.#dynamicRoutes.delete(uploadPath);

        return data;
    }
}
