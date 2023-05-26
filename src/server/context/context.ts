/*
export class Context {
    #isBuilding: boolean;

    #currentComponent: ComponentContext<any> | null;

    #components: ComponentContext<any>[];

    #dispatchers: Map<string, Dispatcher>;

    #hookCount: number;

    #userId: string;

    #address: string;

    #upgrading: Map<string, Html>;

    #clients: Map<string, ClientData>;

    constructor () {
        this.#currentComponent = null;
        this.#components = [];
        this.#isBuilding = false;
        this.#dispatchers = new Map();
        this.#upgrading = new Map();
        this.#clients = new Map();
        this.#hookCount = 0;
        this.#userId = '';
        this.#address = '';
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

    fromRoute (route: InnerRoute | ComponentContext<any>): Context {
        const context = new Context();

        context.#dispatchers = this.#dispatchers;
        context.#components = this.#components;
        context.#currentComponent = this.#currentComponent;
        context.#address = this.#address;

        if (this.#isBuilding) {
            context.#isBuilding = true;

            context.#currentComponent = {
                absolutePath: route.absolutePath,
                component: route.component,
                hookCounter: 0,
                state: new Map(),
                args: [],
            };

            this.#components.push(context.#currentComponent);
        } else {
            const component = this.#components.find((component) => component.absolutePath === route.absolutePath);

            if (!component) {
                throw new Error('Component not found');
            }

            context.#currentComponent = component;
            context.#userId = this.#userId;
        }

        return context;
    }

    init (routes: Route[]) {
        this.#isBuilding = true;

        for (const route of routes) {
            const absolutePath = `/${route.path}`.replace(/\/+/g, '/');
            const context = this.fromRoute({
                absolutePath,
                component: route.component,
            });

            route.component(context);
        }

        this.#isBuilding = false;

        return async (req: IncomingMessage, res: ServerResponse, next: NextFunction) => {
            const request = Request.fromRequest(req);
            const response = new Response(res);

            // the userId is stored in the x-user-id header if none ius found we create a new one
            this.#userId = request.headers['x-user-id'] as string || uuidv4();

            await this.mountComponents(request, response);

            const html = this.render(routes, request);

            if (!html) {
                return next();
            }

            this.#upgrading.set(this.#userId, html);

            const store = `
                <script>
                    window.__USER_ID__ = '${this.#userId}';
                    window.__STATE__ = ${JSON.stringify(html.getParts())};
                </script>
            `;

            // get index.html from public folder
            const filePath = path.join(publicDir, 'index.html');
            // check if file exists
            const exists = await fileExists(filePath);

            if (!exists) {
                return response.html(html.toString());
            }

            await serveFile(filePath, res, (file) => file.toString()
                .replace('{{html}}', html.toString())
                .replace('{{store}}', store));
        };
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
        const args = this.#currentComponent.args;

        const addDispatcher = (dispatchKey: string, dispatcher: Dispatcher<T>) => {
            const newKey = `${key}-${dispatchKey}`;

            this.#dispatchers.set(newKey, dispatcher);

            return newKey;
        };

        const getState = (userId: string, initialState: T): T => {
            const userKey = `${userId}-${key}`;

            if (!this.#currentComponent) {
                throw new Error('Cannot get state outside of component');
            }

            const state = states.get(userKey) || initialState;

            if (!this.#isBuilding && userId !== '') {
                states.set(userKey, state);
            }

            return state;
        };

        const setState = (userId: string, state: T) => {
            if (!this.#currentComponent) {
                throw new Error('Cannot set state outside of component');
            }

            const newUserId = `${userId}-${key}`;

            this.#currentComponent.state.set(newUserId, state);
            // TODO: this should be a deep merge
        };

        this.#hookCount += 1;
        if (this.isBuilding) {
            this.#currentComponent.hookCounter += 1;
        }

        return {
            addDispatcher,
            setState,
            getState,
            args,
            key,
        };
    }

    onMount (mountFunction: MountFunction) {
        if (!this.#currentComponent) {
            throw new Error('Cannot add mount function outside of component');
        }

        if (!this.isBuilding) {
            return;
        }

        this.#currentComponent.onMount = mountFunction;
    }

    onUpgrade (upgradeFunction: UpgradeFunction) {
        if (!this.#currentComponent) {
            throw new Error('Cannot add upgrade function outside of component');
        }

        if (!this.isBuilding) {
            return;
        }

        this.#currentComponent.onUpgrade = upgradeFunction;
    }

    upgradeUser (userId: string, channel: Client, address: string) {
        const userHtml = this.#upgrading.get(userId);

        if (!userHtml) {
            throw new Error('User not found');
        }

        this.#clients.set(userId, {
            channel,
            vDom: userHtml,
        });

        this.#upgrading.delete(userId);
        const sortedComponents = sortBy(this.#components, 'absolutePath', 'desc');
        const componentsToUpgrade = sortedComponents.filter((component) => parseAddress(`${component.absolutePath}/*`.replace(/\/+/g, '/'), address));

        for (const component of componentsToUpgrade) {
            component.onUpgrade?.(channel);
        }
    }

    async mountComponents (req: Request, res: Response) {
        const sortedComponents = sortBy(this.#components, 'absolutePath', 'desc');
        const componentsToMount = sortedComponents.filter((component) => req.matches(component.absolutePath));

        for await (const component of componentsToMount) {
            await component.onMount?.(req, res);
        }
    }

    async performAction (userId: string, action: string, event: LiveEvent, routes: Route[]) {
        const newContext = this.fromUserId(userId);

        newContext.#components = this.#components;
        newContext.#dispatchers = this.#dispatchers;
        newContext.#hookCount = this.#hookCount;
        newContext.#isBuilding = this.#isBuilding;
        newContext.#upgrading = this.#upgrading;
        newContext.#clients = this.#clients;
        newContext.#currentComponent = this.#currentComponent;
        newContext.#components = this.#components;
        newContext.#userId = userId;

        const dispatcher = this.#dispatchers.get(action);
        const client = this.#clients.get(userId);

        if (!dispatcher || !client) {
            throw new Error('Dispatcher not found');
        }

        await dispatcher(event);
        const req = Request.fromSocketEvent({
            client: client.channel,
            payload: event.payload,
        });

        const html = this.render(routes, req);

        if (!html) {
            return;
        }

        const diff = client.vDom.differentiate(html);

        if (isEmpty(diff)) {
            return;
        }

        client.channel.broadcastMessage('update', {
            diff,
        });
    }

    fromUserId (userId: string): Context {
        const context = new Context();

        context.#userId = userId;

        return context;
    }

    render (routes: Route[], request: Request) {
        const route = routes.find((component) => request.matches(component.path));

        if (!route) {
            return null;
        }

        const context = this.fromRoute({
            absolutePath: route.path,
            component: route.component,
        });

        context.#address = request.url.pathname;

        return route.component(context);
    }
}
 */

import fs from 'fs';
import { ServerResponse } from 'http';
import path from 'path';

import type { Client } from '@eleven-am/pondsocket/types';

import { getMimeType } from './router';
import { sortBy, fileExists, deepCompare, isEmpty } from '../helpers/helpers';
import { Route } from '../hooks/useRouter';
import { Args, ServerEvent } from '../hooks/useState';
import { parseAddress } from '../matcher/matcher';
import { Html } from '../parser/parser';
import { Request } from '../wrappers/request';
import { Response } from '../wrappers/response';


export type Dispatcher = (context: Context, event: ServerEvent) => Promise<void> | void;

interface ClientData {
    address: string;
    channel: Client;
    vDom: Html;
}

export type Component = (props: Context) => Html;
type MountFunction = (req: Request, res: Response) => void | Promise<void>;
type UpgradeFunction = (socket: Client) => void | Promise<void>;

interface ComponentContext<T> {
    absolutePath: string;
    component: Component;
    state: Map<string, T>;
    onMount?: MountFunction;
    onUpgrade?: UpgradeFunction;
    onUnmount?: MountFunction;
    hookCounter: number;
    args: Args<T>[];
}

interface RouteContext {
    path: string;
    routes: string[];
    component: Component;
}

interface InnerRoute {
    component: Component;
    absolutePath: string;
}

interface HookLink<T> {
    getState: (userId: string, initialState: T) => T;
    setState: (context: Context, state: T) => void;
}

interface HookDispatcher<T> {
    key: string;
    args: Args<T>[];
    addDispatcher: (key: string, dispatcher: Dispatcher) => string;
}

export class Context {
    #isBuilding: boolean;

    #currentComponent: ComponentContext<any> | null;

    #components: ComponentContext<any>[];

    #dispatchers: Map<string, Dispatcher>;

    #hookCount: number;

    #userId: string;

    #address: string;

    #upgrading: Map<string, Html>;

    #clients: Map<string, ClientData>;

    #routes: RouteContext[];

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

        this.#currentComponent.onMount = mountFunction;
    }

    onUpgrade (upgradeFunction: UpgradeFunction) {
        if (!this.#currentComponent) {
            throw new Error('Cannot add upgrade function outside of component');
        }

        if (!this.#isBuilding) {
            return;
        }

        this.#currentComponent.onUpgrade = upgradeFunction;
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

        this.#upgrading.delete(userId);
        const sortedComponents = sortBy(this.#components, 'absolutePath', 'desc');
        const componentsToUpgrade = sortedComponents.filter((component) => parseAddress(`${component.absolutePath}/*`.replace(/\/+/g, '/'), address));

        for (const component of componentsToUpgrade) {
            component.onUpgrade?.(channel);
        }
    }

    getHook<T> (): HookLink<T> {
        console.log(this.#currentComponent);
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
            const newKey = `${key}-${dispatchKey}`;

            this.#dispatchers.set(newKey, dispatcher);

            return newKey;
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
        this.#isBuilding = false;

        const routeContext: RouteContext = {
            path: absolutePath,
            routes,
            component: route.component,
        };

        if (primary) {
            this.#routes.push(routeContext);
        }

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

        await context.#mountComponents(request, response);

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
            .replace('{{html}}', html.toString())
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

    async #mountComponents (req: Request, res: Response) {
        const sortedComponents = sortBy(this.#components, 'absolutePath', 'desc');
        const componentsToMount = sortedComponents.filter((component) => req.matches(component.absolutePath));

        for await (const component of componentsToMount) {
            await component.onMount?.(req, res);
        }
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

    #serveFile (filePath: string, res: ServerResponse, callback: (data: string) => string) {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading file');
            } else {
                // eslint-disable-next-line callback-return
                const result = callback(data);

                res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
                res.end(result);
            }
        });
    }
}
