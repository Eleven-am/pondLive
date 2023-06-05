import fs from 'fs';
import { ServerResponse, IncomingMessage } from 'http';
import path from 'path';

import { Context, UpdateData, PondLiveHeaders } from './context';
import { Component, LiveContext } from './liveContext';
import { getMimeType } from './router';
import { uuidV4, deepCompare, fileExists } from '../helpers/helpers';
import { NextFunction } from '../middleware/middleware';
import { html } from '../parser/parser';
import { Request } from '../wrappers/request';
import { Response } from '../wrappers/response';
import { ServerEvent } from '../wrappers/serverEvent';


type HookFunction = (event: ServerEvent) => void;
export type MountFunction = (req: Request, res: Response) => void | Promise<void>;
export type UpgradeFunction = (event: ServerEvent) => void | Promise<void>;
export type UnmountFunction = (event: ServerEvent) => void | Promise<void>;

type Hook<T> = {
    state: Map<string, T>;
    args: Record<string, T | ((state: T, event: ServerEvent) => T | Promise<T>)>;
}

export class Manager {
    readonly id: string;

    readonly #hooks: Map<string, Hook<any>>;

    readonly #functionMap: Map<string, HookFunction>;

    readonly #mountFunctions: MountFunction[];

    readonly #upgradeFunctions: UpgradeFunction[];

    readonly #unmountFunctions: UnmountFunction[];

    readonly #component: Component;

    readonly #state: Map<string, unknown>;

    readonly #mountedUsers: Set<string>;

    readonly #upgradedUsers: Set<string>;

    readonly #absolutePath: string;

    readonly #context: Context;

    #isBuilt: boolean;

    #routes: string[];

    constructor (context: Context, component: Component, absolutePath: string) {
        this.#mountFunctions = [];
        this.#upgradeFunctions = [];
        this.#unmountFunctions = [];
        this.#component = component;
        this.#state = new Map();
        this.#isBuilt = false;
        this.#functionMap = new Map();
        this.#mountedUsers = new Set();
        this.#upgradedUsers = new Set();
        this.id = Math.random()
            .toString(36)
            .substring(7);
        this.#hooks = new Map();
        this.#absolutePath = absolutePath;
        this.#context = context;
        this.#routes = [];
    }

    get component () {
        return this.#component;
    }

    get isBuilt () {
        return this.#isBuilt;
    }

    get path () {
        return this.#absolutePath;
    }

    get routes () {
        return this.#routes;
    }

    doneBuilding () {
        this.#isBuilt = true;
    }

    onMount (fn: MountFunction) {
        if (this.#isBuilt) {
            return;
        }

        this.#mountFunctions.push(fn);
    }

    onUpgrade (fn: UpgradeFunction) {
        if (this.#isBuilt) {
            return;
        }

        this.#upgradeFunctions.push(fn);
    }

    onUnmount (fn: UnmountFunction) {
        if (this.#isBuilt) {
            return;
        }

        this.#unmountFunctions.push(fn);
    }

    mount (req: Request, res: Response) {
        if (!this.#isBuilt) {
            throw new Error('Cannot mount component before the building phase');
        }

        if (this.#mountedUsers.has(req.userId)) {
            return;
        }

        this.#mountedUsers.add(req.userId);
        this.#mountFunctions.forEach((fn) => fn(req, res));
    }

    upgrade (event: ServerEvent) {
        if (!this.#isBuilt) {
            throw new Error('Cannot upgrade component before the building phase');
        }

        if (this.#upgradedUsers.has(event.userId)) {
            return;
        }

        this.#upgradedUsers.add(event.userId);
        this.#upgradeFunctions.forEach((fn) => fn(event));
    }

    unmount (event: ServerEvent) {
        if (!this.#isBuilt) {
            throw new Error('Cannot unmount component before the building phase');
        }

        if (!this.#mountedUsers.has(event.userId) && !this.#upgradedUsers.has(event.userId)) {
            return;
        }

        this.#unmountFunctions.forEach((fn) => fn(event));
        this.#mountedUsers.delete(event.userId);
        this.#upgradedUsers.delete(event.userId);
        for (const [_, hook] of this.#hooks) {
            hook.state.delete(event.userId);
        }
    }

    setUpHook (hookCount: number) {
        const hookKey = `hook-${this.id}-${hookCount}`;
        let hookFunctions = this.#hooks.get(hookKey);

        if (!hookFunctions) {
            if (this.#isBuilt) {
                throw new Error('Cannot add hook after building phase');
            }

            hookFunctions = {
                args: {},
                state: new Map(),
            };
            this.#hooks.set(hookKey, hookFunctions);
        }

        return hookKey;
    }

    addHookFunction (hookKey: string, arg: unknown, fn: HookFunction): string {
        const hook = this.#hooks.get(hookKey);

        if (!hook) {
            throw new Error('Cannot add hook function to non existing hook');
        }

        const argKey = Object.keys(hook.args).find((key) => deepCompare(hook.args[key], arg));

        if (argKey) {
            this.#functionMap.set(argKey, fn);

            return argKey;
        }

        const newArgKey = `${hookKey}-${Math.random()
            .toString(36)
            .substring(7)}`;

        hook.args[newArgKey] = arg;
        this.#functionMap.set(newArgKey, fn);

        return newArgKey;
    }

    getHookState<T> (hookKey: string, initialState: T, userId: string): T {
        const hook = this.#hooks.get(hookKey);

        if (!hook) {
            throw new Error('Cannot get hook state from non existing hook');
        }

        if (!hook.state.has(userId)) {
            hook.state.set(userId, initialState);
        }

        return hook.state.get(userId) as T;
    }

    setHookState<T> (hookKey: string, newState: T, userId: string) {
        const hook = this.#hooks.get(hookKey);

        if (!hook) {
            throw new Error('Cannot set hook state from non existing hook');
        }

        hook.state.set(userId, newState);
        const notEqual = deepCompare(hook.state.get(userId), newState);

        if (!notEqual) {
            return;
        }

        this.#context.reload(userId);
    }

    render (address: string, userId: string) {
        const liveContext = new LiveContext(userId, address, this.#context, this);

        const htmlData = this.#component(liveContext);

        const routes = liveContext.routes;
        const styles = liveContext.styles;

        this.#routes = [...new Set([...this.#routes, ...routes, this.#absolutePath])];

        return html`${styles}${htmlData}`;
    }

    performAction (event: ServerEvent) {
        const fn = this.#functionMap.get(event.action);

        if (!fn) {
            return;
        }

        fn(event);
    }

    handleHttpRequest (req: IncomingMessage, res: ServerResponse, next: NextFunction, publicDir: string[]) {
        const route = this.#routes.find((route) => route.match(req.url ?? ''));

        if (!route) {
            return next();
        }

        let userId = req.headers[PondLiveHeaders.LIVE_USER_ID] as string;

        if (!userId) {
            userId = uuidV4();
            const request = Request.fromRequest(req, userId);
            const response = new Response(res);

            return this.#handleFirstHttpRequest(request, response, publicDir);
        }

        const request = Request.fromRequest(req, userId);
        const response = new Response(res);

        return this.#handleSubsequentHttpRequest(request, response, next);
    }

    canRender (address: string) {
        return this.#routes.some((route) => route.match(address));
    }

    createContext (address: string, userId: string) {
        return new LiveContext(userId, address, this.#context, this);
    }

    async #handleFirstHttpRequest (req: Request, res: Response, publicDir: string[]) {
        await this.#context.mountUser(req, res);
        const html = this.render(req.url.pathname, req.userId);

        this.#context.addUpgradingUser(req.userId, html);

        const title = res.get(PondLiveHeaders.LIVE_PAGE_TITLE) ?? 'Pond Live';

        const store = `
                <script>
                    window.__USER_ID__ = '${req.userId}';
                    window.__STATE__ = ${JSON.stringify(html.getParts())};
                </script>
            `;

        const promises = publicDir.map((dir) => fileExists(path.join(dir, 'index.html')));
        const folder = (await Promise.all(promises))
            .map((exists, index) => ({
                exists,
                folder: publicDir[index],
            }))
            .find((folder) => folder.exists)?.folder;

        if (!folder) {
            const index = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>${title}</title>
                    ${store}
                </head>
                <body>
                    <div id="app">${html.toString()
        .trim()}</div>
                    <script src="/pondLive.js" defer></script>
                </body>
                </html>
            `.trim();

            res.html(index);

            return;
        }

        this.#serveFile(path.join(folder, 'index.html'), res.response, (data) => data
            .replace(/<head>/, `<head>${store}`)
            .replace(/<body>/, `<body><div id="app">${html.toString()
                .trim()}</div><script src="/pondLive.js" defer></script>`)
            .replace(/<title>(.*?)<\/title>/, `<title>${title}</title>`));
    }

    async #handleSubsequentHttpRequest (req: Request, res: Response, next: NextFunction) {
        const client = this.#context.getClient(req.userId);

        if (req.headers[PondLiveHeaders.LIVE_ROUTER] !== 'true') {
            return next();
        }

        if (!client) {
            res.status(500).json({ error: 'Client not found' });

            return;
        }

        const event = new ServerEvent(req.userId, client.channel, this.#context, {
            action: 'navigate',
            address: req.url.toString(),
            value: null,
            dataId: null,
        });

        await this.#context.mountUser(req, res);
        await this.#context.upgradeUser(event);

        const html = this.render(req.url.pathname, req.userId);
        const diff = client.virtualDom.differentiate(html);

        client.virtualDom = html;
        client.address = req.url.toString();
        const title = res.get(PondLiveHeaders.LIVE_PAGE_TITLE) ?? 'Pond Live';

        const data: UpdateData = {
            diff,
            [PondLiveHeaders.LIVE_PAGE_TITLE]: title as string,
        };

        res.json(data);
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
