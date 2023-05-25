import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';

import { parseAddress } from '../matcher/matcher';
import { Html, html } from '../parser/parser';
import { Request } from '../wrappers/request';
import { Response } from '../wrappers/response';

type Component = (props: Context) => Html;
type MountFunction = (req: Request, res: Response) => void | Promise<void>;

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
    onUpgrade?: MountFunction;
    onUnmount?: MountFunction;
    hookCounter: number;
    args: Args<T>[];
}

interface LiveEvent {
    type: string;
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
    getState: (initialState: T) => T;
    setState: (state: T) => void;
    args: Args<T>[];
    addDispatcher: (key: string, dispatcher: Dispatcher<T>) => string;
}

type EventAction<T> = Record<string, (event: LiveEvent) => T | Promise<T>>;
type CreatedAction<T extends EventAction<any>> = [ReturnType<T[keyof T]> | null, RunAction<T>]

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

export class Context {
    #isBuilding: boolean;

    #currentComponent: ComponentContext<any> | null;

    #components: ComponentContext<any>[];

    #dispatchers: Map<string, Dispatcher>;

    #hookCount: number;

    #userId: string;

    #address: string;

    constructor () {
        this.#currentComponent = null;
        this.#components = [];
        this.#isBuilding = false;
        this.#dispatchers = new Map();
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
            const request = new Request(req);
            const response = new Response(res);

            await this.mountComponents(request, response);

            const route = routes.find((component) => request.matches(component.path));

            if (!route) {
                return next();
            }

            const context = this.fromRoute({
                absolutePath: route.path,
                component: route.component,
            });

            context.#address = request.url.pathname;
            const html = route.component(context);

            // for testing
            return response.html(html.toString());
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
        const userKey = `${this.#userId}-${key}`;

        const addDispatcher = (dispatchKey: string, dispatcher: Dispatcher<T>) => {
            const newKey = `${key}-${dispatchKey}`;

            this.#dispatchers.set(newKey, dispatcher);

            return newKey;
        };

        const getState = (initialState: T): T => states.get(userKey) ?? initialState;

        const setState = (state: T) => {
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

    async mountComponents (req: Request, res: Response) {
        const sortedComponents = sortBy(this.#components, 'absolutePath', 'desc');
        const componentsToMount = sortedComponents.filter((component) => req.matches(component.absolutePath));

        for await (const component of componentsToMount) {
            await component.onMount?.(req, res);
        }
    }
}

function useState<T> (context: Context, initialState: T): CreatedState<T> {
    const { addDispatcher, getState, key, args, setState } = context.getHook<T>();

    function get (): T {
        return getState(initialState);
    }

    async function internalMutate (state: (T | ((state: T, event: LiveEvent) => T | Promise<T>)), event: LiveEvent): Promise<T> {
        let newState: T;
        const currentState = getState(initialState);

        if (typeof state === 'function') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            newState = await state(currentState, event);
        } else {
            newState = state;
        }

        setState(newState);

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
            <button onclick=${action('log')}>Log</button>
        </div>
    `;
}

class Router {
    #routes: Route[] = [];

    addRoute (path: string, component: Component) {
        this.#routes.push({
            path,
            component,
        });
    }

    createContext () {
        const context = new Context();

        const handleRequest = context.init(this.#routes);

        return async (req: IncomingMessage, res: ServerResponse) => {
            await handleRequest(req, res, () => {
                res.statusCode = 404;
                res.end('Not found');
            });
        };
    }
}

const router = new Router();

router.addRoute('/', Index);

const server = http.createServer(router.createContext());

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
