import type { Client } from '@eleven-am/pondsocket/types';

import { Route } from './liveContext';
import { Manager } from './manager';
import { isEmpty } from '../helpers/helpers';
import { Html } from '../parser/parser';
import { ServerEvent } from '../wrappers/serverEvent';


interface ClientData {
    address: string;
    channel: Client;
    virtualDom: Html;
}

/* export class Context {
    #isBuilding: boolean;

    #currentComponent: ComponentContext<any> | null;

    #components: ComponentContext<any>[];

    #dispatchers: Map<string, Dispatcher>;

    #hookCount: number;

    #userId: string;

    #address: string;

    #upgrading: Map<string, Html>;


    #routes: RouteContext[];

    readonly #id: string;

    constructor () {
        this.#currentComponent = null;
        this.#components = [];
        this.#routes = [];
        this.#isBuilding = false;
        this.#dispatchers = new Map();
        this.#upgrading = new Map();
        this.#clients = new Map();
        this.#hookCount = 0;
        this.#userId = '';
        this.#address = '';
        this.#id = Math.random().toString(36)
            .substr(2, 9);
    }

    get address (): string {
        return this.#address;
    }

    get isBuilding (): boolean {
        return this.#isBuilding;
    }

    get currentComponent (): ComponentContext<any> {
        if (!this.#currentComponent) {
            throw new Error('Cannot add routes outside of a component');
        }

        return this.#currentComponent;
    }

    get userId (): string {
        return this.#userId;
    }

    get id (): string {
        return this.#id;
    }

    fromUserId (userId: string): Context {
        const context = this.#clone();

        context.#userId = userId;

        return context;
    }

    fromRoute (component: ComponentContext<any> | InnerRoute): Context {
        const context = this.#clone();

        if (this.#isBuilding) {
            context.#isBuilding = true;

            context.#currentComponent = {
                absolutePath: component.absolutePath,
                component: component.component,
                onMount: [],
                onUpgrade: [],
                onUnmount: [],
                hookCounter: 0,
                state: new Map(),
                args: [],
            };

            this.#components.push(context.#currentComponent);
        } else {
            const innerComponent = this.#components.find((c) => component.absolutePath === c.absolutePath);

            if (!component) {
                throw new Error('Component not found');
            }

            context.#currentComponent = innerComponent as ComponentContext<any>;
        }

        return context;
    }

    onMount (mountFunction: MountFunction) {
        if (!this.#currentComponent) {
            throw new Error('Cannot add mount function outside of component');
        }

        if (!this.#isBuilding) {
            return;
        }

        this.#currentComponent.onMount.push(mountFunction);
    }

    onUpgrade (upgradeFunction: UpgradeFunction) {
        if (!this.#currentComponent) {
            throw new Error('Cannot add upgrade function outside of component');
        }

        if (!this.#isBuilding) {
            return;
        }

        this.#currentComponent.onUpgrade.push(upgradeFunction);
    }

    upgradeUser (userId: string, channel: Client, address: string) {
        const userHtml = this.#upgrading.get(userId);

        if (!userHtml) {
            throw new Error('User not found');
        }

        this.#clients.set(userId, {
            channel,
            vDom: userHtml,
            address,
        });

        const req = Request.fromSocketEvent({
            address,
            client: channel,
        });

        const context = this.fromUserId(userId);

        this.#upgrading.delete(userId);

        const sortedComponents = sortBy(context.#components, 'absolutePath', 'desc');
        const componentsToUpgrade = sortedComponents.filter((component) => req.matches(component.absolutePath));

        const promises = componentsToUpgrade.flatMap((component) => component.onUpgrade.map((upgrade) => {
            const event = new ServerEvent(component.absolutePath, userId, channel, { address } as any);

            return upgrade(event);
        }));

        return Promise.all(promises);
    }

    getHook<T> (): HookLink<T> {
        if (!this.#currentComponent) {
            throw new Error('Cannot add hook outside of component');
        }

        if (this.#hookCount >= this.#currentComponent.hookCounter && !this.#isBuilding) {
            throw new Error('A hook was added after the component had rendered');
        }

        const key = `${this.#currentComponent.absolutePath}-${this.#hookCount}`;
        const states = this.#currentComponent.state;

        const getState = (userId: string, initialState: T): T => {
            const userKey = `${userId}-${key}`;

            if (!this.#currentComponent) {
                throw new Error('Cannot get state outside of component');
            }

            const state = states.get(userKey) || initialState;

            if (!this.#isBuilding && userId !== '' && !states.has(userKey)) {
                states.set(userKey, state);
            }

            return state;
        };

        const setState = (context: Context, state: T) => {
            if (!this.#currentComponent) {
                throw new Error('Cannot set state outside of component');
            }

            const userKey = `${context.userId}-${key}`;
            const currentState = states.get(userKey);

            states.set(userKey, state);
            if (!deepCompare(currentState, state)) {
                context.reload(context.userId);
            }
        };

        return {
            getState,
            setState,
        };
    }

    hookDispatcher<T> (): HookDispatcher<T> {
        if (!this.#currentComponent) {
            throw new Error('Cannot add hook outside of component');
        }

        if (this.#hookCount >= this.#currentComponent.hookCounter && !this.#isBuilding) {
            throw new Error('A hook was added after the component had rendered');
        }

        const key = `${this.#currentComponent.absolutePath}-${this.#hookCount}`;
        const args = this.#currentComponent.args;

        const addDispatcher = (dispatchKey: string, dispatcher: Dispatcher) => {
            this.#dispatchers.set(dispatchKey, dispatcher);

            return dispatchKey;
        };

        this.#hookCount += 1;

        return {
            key,
            args,
            addDispatcher,
        };
    }

    initRoute (route: Route, primary = false) {
        const absolutePath = `/${route.path}`.replace(/\/+/g, '/');

        this.#isBuilding = true;

        const context = this.fromRoute({
            absolutePath,
            component: route.component,
        });

        context.#isBuilding = true;
        context.#components = [];
        route.component(context);

        context.currentComponent.hookCounter = context.#hookCount;
        const routes = context.#components.map((c) => c.absolutePath);

        this.#components.push(...context.#components);

        const routeContext: RouteContext = {
            path: absolutePath,
            routes,
            component: route.component,
        };

        if (primary) {
            this.#routes.push(routeContext);
            this.#isBuilding = false;
        }

        context.#isBuilding = false;

        return routeContext;
    }

    async performAction (userId: string, action: string, event: ServerEvent) {
        const dispatcher = this.#dispatchers.get(action);
        const client = this.#clients.get(userId);
        const context = this.fromUserId(userId);

        if (!dispatcher || !client) {
            throw new Error('Dispatcher not found');
        }

        await dispatcher(context, event);
    }

    reload (userId: string): void {
        const client = this.#clients.get(userId);

        if (!client) {
            return;
        }

        const context = this.fromUserId(userId);

        context.#currentComponent = null;

        const req = Request.fromSocketEvent({
            client: client.channel,
            address: client.address,
        });

        const route = this.#routes.find((r) => req.matches(r.path));

        if (!route) {
            return;
        }

        const html = context.#render(req, route, userId);
        const diff = client.vDom.differentiate(html);

        if (isEmpty(diff)) {
            return;
        }

        client.channel.broadcastMessage('update', {
            diff,
        });

        client.vDom = html;
    }

    async renderToString (request: Request, response: Response, route: Route, userId: string, publicDir: string) {
        const context = this.fromUserId(userId);

        context.#currentComponent = null;

        await context.#mountComponents(request, response, userId);

        const html = context.#render(request, route, userId);

        context.#upgrading.set(userId, html);

        const store = `
                <script>
                    window.__USER_ID__ = '${context.#userId}';
                    window.__STATE__ = ${JSON.stringify(html.getParts())};
                </script>
            `;

        const filePath = path.join(publicDir, 'index.html');
        const exists = await fileExists(filePath);

        if (!exists) {
            return response.html(html.toString());
        }

        await context.#serveFile(filePath, response.response, (file) => file.toString()
            .replace('{{html}}', html.toString().trim())
            .replace('{{store}}', store));
    }

    #render (request: Request, route: Route, userId: string) {
        const context = this.fromRoute({
            absolutePath: route.path,
            component: route.component,
        });

        context.#address = request.url.pathname;
        context.#userId = userId;

        return route.component(context);
    }

    #mountComponents (req: Request, res: Response, userId: string) {
        const context = this.fromUserId(userId);

        const sortedComponents = sortBy(context.#components, 'absolutePath', 'desc');
        const componentsToMount = sortedComponents.filter((component) => req.matches(component.absolutePath));

        const promises = componentsToMount.flatMap((component) => component.onMount.map((onMount) => onMount(req, res)));

        return Promise.all(promises);
    }

    #clone () {
        const context = new Context();

        context.#userId = this.#userId;
        context.#address = this.#address;
        context.#components = this.#components;
        context.#dispatchers = this.#dispatchers;
        context.#hookCount = 0;
        context.#isBuilding = this.#isBuilding;
        context.#upgrading = this.#upgrading;
        context.#clients = this.#clients;
        context.#currentComponent = this.#currentComponent;
        context.#routes = this.#routes;

        return context;
    }


}*/


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

        if (isEmpty(diff)) {
            return;
        }

        client.channel.broadcastMessage('update', {
            diff,
        });

        client.virtualDom = html;
    }

    fromPath (path: string, userId: string) {
        const manager = this.#managers.find((m) => m.canRender(path));

        if (!manager) {
            throw new Error(`No manager found for path ${path}`);
        }

        return manager.createContext(path, userId);
    }
}
