import { Context } from './context';
import { Manager, MountFunction, UpgradeFunction, UnmountFunction } from './manager';
import { Html } from '../parser/parser';

export type Component = (props: LiveContext) => Html;

export interface Route {
    path: string;
    component: Component;
}

export class LiveContext {
    readonly #context: Context;

    readonly #manager: Manager;

    readonly #userId: string;

    readonly #address: string;

    #hookCount: number;

    #routes: string[];

    #styles: Html[];

    constructor (userId: string, address: string, context: Context, manager: Manager) {
        this.#context = context;
        this.#manager = manager;
        this.#userId = userId;
        this.#hookCount = -1;
        this.#routes = [];
        this.#address = address;
        this.#styles = [];
    }

    get userId (): string {
        return this.#userId;
    }

    get isBuilt (): boolean {
        return this.#manager.isBuilt;
    }

    get manager (): Manager {
        return this.#manager;
    }

    get address (): string {
        return this.#address;
    }

    get routes (): string[] {
        return this.#routes;
    }

    get styles () {
        return this.#styles;
    }

    onMount (fn: MountFunction) {
        this.#manager.onMount(fn);
    }

    onUpgrade (fn: UpgradeFunction) {
        this.#manager.onUpgrade(fn);
    }

    onUnmount (fn: UnmountFunction) {
        this.#manager.onUnmount(fn);
    }

    setUpHook <T> (initialState: T, _debugValue: string) {
        this.#hookCount += 1;

        const hookKey = this.#manager.setUpHook(this.#hookCount);
        const getState = this.#manager.getHookState.bind(this.#manager, hookKey, initialState) as (userId: string) => T;
        const setState = this.#manager.setHookState.bind(this.#manager, hookKey) as (state: T, userId: string) => void;
        const addDispatcher = this.#manager.addHookFunction.bind(this.#manager, hookKey);

        return {
            getState,
            setState,
            addDispatcher,
        };
    }

    reload () {
        this.#context.reload(this.#userId);
    }

    initRoute (route: Route) {
        const absolutePath = `${this.#manager.path}/${route.path}`.replace(/\/+/g, '/');

        const manager = this.#context.initRoute({
            path: absolutePath,
            component: route.component,
        });

        this.#routes = [...this.#routes, ...manager.routes, absolutePath];

        return manager;
    }

    fromManager (manager: Manager) {
        return this.#context.fromPath(manager.path, this.#userId);
    }

    addStyle (css: Html) {
        this.#styles = [...this.#styles, css];
    }

    getManager (path: string) {
        const absolutePath = `${this.#manager.path}${path}`.replace(/\/+/g, '/');

        return this.#context.getManager(absolutePath);
    }
}
