import * as fs from 'fs';
import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import path from 'path';

import PondSocket from '@eleven-am/pondsocket';
import type { Client, PondMessage } from '@eleven-am/pondsocket/types';

import { Request } from '../../wrappers/request';
import { Response } from '../../wrappers/response';
import { parseAddress } from '../matcher/matcher';
import { Html, html } from '../parser/parser';

type Component = (props: Context) => Html;
type MountFunction = (req: Request, res: Response) => void | Promise<void>;
type UpgradeFunction = (socket: Client) => void | Promise<void>;

interface Route {
    path: string;
    component: Component;
}

interface InnerRoute {
    component: Component;
    absolutePath: string;
}

interface Args<T> {
    key: string;
    value: (T | ((state: T, event: LiveEvent) => T | Promise<T>));
}

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

interface LiveEvent {
    type: string;
    userId: string;
    payload: PondMessage;
}

type KeyOf<T> = keyof T;
type SortingOrder = 'asc' | 'desc';
type SetState<T> = (state: (T | ((state: T, event: LiveEvent) => T | Promise<T>))) => string;
type RunAction<T> = (event: KeyOf<T>) => string;
type Dispatcher<T = any> = (event: LiveEvent) => Promise<T>;
type CreatedState<T> = [T, SetState<T>];
type NextFunction = (err?: Error) => void;

interface HookLink<T> {
    key: string;
    getState: (userId: string, initialState: T) => T;
    setState: (userId: string, state: T) => void;
    args: Args<T>[];
    addDispatcher: (key: string, dispatcher: Dispatcher<T>) => string;
}

type EventAction<T> = Record<string, (event: LiveEvent) => T | Promise<T>>;
type CreatedAction<T extends EventAction<any>> = [ReturnType<T[keyof T]> | null, RunAction<T>]

const publicDir = path.join(__dirname, '../../../dist');

const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'text/javascript',
};

function fileExists (filePath: string) {
    return new Promise<boolean>((resolve) => {
        fs.stat(filePath, (err, stats) => {
            if (err) {
                return resolve(false);
            }

            resolve(stats.isFile());
        });
    });
}

function getMimeType (filePath: string) {
    const extname = path.extname(filePath);

    return mimeTypes[extname] || 'text/html';
}

function serveFile (filePath: string, res: ServerResponse, callback: (data: string) => string) {
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

export function sortBy<DataType> (array: DataType[], keys: KeyOf<DataType> | KeyOf<DataType>[], order: SortingOrder | SortingOrder[]): DataType[] {
    const sortFields = Array.isArray(keys) ? keys : [keys];
    const ordersArray = Array.isArray(order) ? order : [order];

    return array.sort((a, b) => {
        let i = 0;

        while (i < sortFields.length) {
            if (ordersArray[i] === 'asc') {
                if (a[sortFields[i]] < b[sortFields[i]]) {
                    return -1;
                }
                if (a[sortFields[i]] > b[sortFields[i]]) {
                    return 1;
                }
            } else {
                if (a[sortFields[i]] < b[sortFields[i]]) {
                    return 1;
                }
                if (a[sortFields[i]] > b[sortFields[i]]) {
                    return -1;
                }
            }
            i++;
        }

        return 0;
    });
}

function uuidv4 () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        // eslint-disable-next-line no-bitwise
        const r = Math.random() * 16 | 0;
        // eslint-disable-next-line no-bitwise
        const v = c === 'x' ? r : (r & 0x3 | 0x8);

        return v.toString(16);
    });
}

export function deepCompare (firstObject: any, secondObject: any): boolean {
    if (firstObject === secondObject) {
        return true;
    }

    if (typeof firstObject === 'function' && typeof secondObject === 'function') {
        return firstObject.toString() === secondObject.toString();
    }

    if (firstObject instanceof Date && secondObject instanceof Date) {
        return firstObject.getTime() === secondObject.getTime();
    }

    if (Array.isArray(firstObject) && Array.isArray(secondObject)) {
        if (firstObject.length !== secondObject.length) {
            return false;
        }

        return firstObject.every((item, index) => deepCompare(item, secondObject[index]));
    }

    if (firstObject && secondObject && typeof firstObject === 'object' && typeof secondObject === 'object') {
        if (firstObject.constructor !== secondObject.constructor) {
            return false;
        }
        const properties = Object.keys(firstObject);

        if (properties.length !== Object.keys(secondObject).length) {
            return false;
        }

        return properties.every((prop) => deepCompare(firstObject[prop], secondObject[prop]));
    }

    return false;
}

function isEmpty (obj: any): boolean {
    return Object.keys(obj).length === 0;
}

interface ClientData {
    channel: Client;
    vDom: Html;
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

function useState<T> (context: Context, initialState: T): CreatedState<T> {
    const { addDispatcher, getState, key, args, setState } = context.getHook<T>();

    function get (): T {
        return getState(context.userId, initialState);
    }

    async function internalMutate (state: (T | ((state: T, event: LiveEvent) => T | Promise<T>)), event: LiveEvent): Promise<T> {
        let newState: T;
        const currentState = getState(event.userId, initialState);

        if (typeof state === 'function') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            newState = await state(currentState, event);
        } else {
            newState = state;
        }

        setState(event.userId, newState);

        return newState;
    }

    function mutate (state: (T | ((state: T, event: LiveEvent) => T | Promise<T>))): string {
        const arg = args.find((arg) => deepCompare(arg.value, state));

        if (arg) {
            return arg.key;
        }

        const string = Math.random()
            .toString(36)
            .substring(7);

        args.push({
            key: `${key}-${string}`,
            value: state,
        });

        return addDispatcher(string, (event) => internalMutate(state, event));
    }

    return [get(), mutate];
}

function useRouter (routes: Route[]): Component {
    return (context) => {
        const { currentComponent, address } = context;

        if (context.isBuilding) {
            routes.forEach((route) => {
                const newContext = context.fromRoute({
                    absolutePath: `${currentComponent.absolutePath}/${route.path}`.replace(/\/+/g, '/'),
                    component: route.component,
                });

                route.component(newContext);
            });

            return html``;
        }

        const sortedRoutes = sortBy(routes, 'path', 'desc');
        const route = sortedRoutes.find((route) => parseAddress(`${currentComponent.absolutePath}/${route.path}/*`.replace(/\/+/g, '/'), address));

        if (!route) {
            return html``;
        }

        const newContext = context.fromRoute({
            absolutePath: `${currentComponent.absolutePath}${route.path}`.replace(/\/+/g, '/'),
            component: route.component,
        });

        return route.component(newContext);
    };
}

function useEventActions<T extends EventAction<any>> (context: Context, actions: T): CreatedAction<T> {
    const [state, setState] = useState<ReturnType<T[keyof T]> | null>(context, null);

    function performAction (type: KeyOf<T>, event: LiveEvent) {
        const action = actions[type];

        if (!action) {
            return null;
        }

        return action(event);
    }

    function mutate (type: KeyOf<T>) {
        return setState((state, event) => performAction(type, event) ?? state);
    }

    return [state, mutate];
}

function Counter (context: Context) {
    const [count, setCount] = useState(context, 0);

    context.onUpgrade((channel) => {
        channel.broadcastMessage('counter', {
            count,
        });
    });

    return html`
        <div>
            <h1>${count}</h1>
            <button pond-click=${setCount((state) => state + 1)}>Increment</button>
            <button pond-click=${setCount((state) => state - 1)}>Decrement</button>
            <button pond-click=${setCount(0)}>Reset</button>
        </div>
    `;
}

function Index (context: Context) {
    const stateRouter = useRouter([
        {
            path: '/counter',
            component: Counter,
        },
    ]);
    const [_, action] = useEventActions(context, {
        log: (e) => console.log(e),
    });

    return html`
        <div>
            <h1>Index</h1>
            <a href="/counter">Counter</a>
            ${stateRouter(context)}
            <button pond-click=${action('log')}>Log</button>
        </div>
    `;
}

export async function serveStatic (req: IncomingMessage, res: ServerResponse, next: () => void) {
    const filePath = path.join(publicDir, req.url!);

    if (!path.extname(filePath)) {
        return next();
    }

    if (!await fileExists(filePath)) {
        // TODO: 404 page handle this more gracefully
        res.statusCode = 404;
        res.end('Not found');

        return;
    }

    const fileStream = fs.createReadStream(filePath);

    const extension = path.extname(filePath);

    res.setHeader('Content-Type', mimeTypes[extension] ?? 'text/plain');

    fileStream.pipe(res);
}

class Router {
    readonly #routes: Route[];

    #context: Context;

    constructor () {
        this.#context = new Context();
        this.#routes = [];
    }

    addRoute (path: string, component: Component) {
        this.#routes.push({
            path,
            component,
        });
    }

    createContext () {
        const handleRequest = this.#context.init(this.#routes);

        return async (req: IncomingMessage, res: ServerResponse) => {
            await serveStatic(req, res, async () => {
                await handleRequest(req, res, () => {
                    res.statusCode = 404;
                    res.end('Not found');
                });
            });
        };
    }

    upgradeUser (userId: string, channel: Client, address: string) {
        this.#context.upgradeUser(userId, channel, address);
    }

    performAction (userId: string, action: string, event: LiveEvent) {
        return this.#context.performAction(userId, action, event, this.#routes);
    }
}

const router = new Router();

router.addRoute('/', Index);

const server = http.createServer(router.createContext());
const pondSocket = new PondSocket(server);

const endpoint = pondSocket.createEndpoint('/live', (_request, response) => {
    response.accept();
});

const channel = endpoint.createChannel('/:userId', (request, response) => {
    response.accept({
        userId: request.event.params.userId,
    });
    const userId = request.event.params.userId;
    const channel = request.client;
    const address = request.joinParams.address as string;

    router.upgradeUser(userId, channel, address || '/');
});

channel.onEvent('event', async (request, response) => {
    const userId = request.user.assigns.userId as string;
    const action = request.event.payload.action as string;

    response.accept();
    await router.performAction(userId, action, {
        type: 'event',
        payload: request.event.payload,
        userId,
    });
});

pondSocket.listen(3000, () => {
    console.log('Listening on port 3000');
});
