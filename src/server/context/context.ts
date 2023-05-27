import type { Client } from '@eleven-am/pondsocket/types';

import { Route } from './liveContext';
import { Manager } from './manager';
import { isEmpty, sortBy } from '../helpers/helpers';
import { Html } from '../parser/parser';
import { ServerEvent } from '../wrappers/serverEvent';


interface ClientData {
    address: string;
    channel: Client;
    virtualDom: Html;
}

export class Context {
    #clients: Map<string, ClientData>;

    #managers: Manager[];

    #entryManagers: Manager[];

    #upgrading: Map<string, Html>;

    constructor () {
        this.#clients = new Map();
        this.#upgrading = new Map();
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

    upgradeUser (userId: string, channel: Client, address: string) {
        const html = this.#upgrading.get(userId);

        if (!html) {
            throw new Error('No html found');
        }

        const client: ClientData = {
            channel,
            address,
            virtualDom: html,
        };

        this.#clients.set(userId, client);
        this.#upgrading.delete(userId);
        const event = new ServerEvent(userId, channel, {
            address,
            action: 'upgrade',
            value: null,
            dataId: null,
        });

        const managersToMount = this.#managers.filter((manager) => event.matches(manager.path));
        const promises = managersToMount.map((manager) => manager.upgrade(event));

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

        const event = new ServerEvent(userId, client.channel, {
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

        console.log('html', userId, html);

        if (isEmpty(diff)) {
            return;
        }

        client.channel.broadcastMessage('update', {
            diff,
        });

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
}
