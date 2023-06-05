import { Context } from './context';
import { Component } from './liveContext';
import { html } from '../parser/parser';
import { Request } from '../wrappers/request';
import { Response } from '../wrappers/response';
import { ServerEvent } from '../wrappers/serverEvent';

const createEvent = (userId: string, context: Context, address = '/example') => {
    const client = {
        broadcastMessage: jest.fn(),
        banUser: jest.fn(),
    } as any;

    const event = new ServerEvent(userId, client, context, {
        address: `http://localhost:3000${address}`,
        action: 'upgrade',
        value: null,
        dataId: null,
    });

    return {
        event,
        client,
    };
};

const createMocks = (options: any) => {
    const request = {
        method: 'GET',
        url: '/',
        ...options,
    };

    const response = {
        ...options,
    };

    const req = Request.fromRequest(request, 'user123');
    const res = new Response(response as any);

    return {
        req,
        res,
    };
};

describe('Context', () => {
    let context: Context;
    const ExampleComponent: Component = () => html`<h1>Hello World</h1>`;

    beforeEach(() => {
        context = new Context();
    });

    describe('initRoute', () => {
        test('should initialize a new route manager', () => {
            const route = {
                path: '/example',
                component: ExampleComponent,
            };
            const manager = context.initRoute(route);

            expect(manager.path).toBe('/example');
            expect(manager.component).toBe(ExampleComponent);
        });

        test('should throw an error if the route already exists', () => {
            const route = {
                path: '/example',
                component: ExampleComponent,
            };

            context.initRoute(route);

            expect(() => context.initRoute(route)).toThrowError('Route /example already exists');
        });
    });

    describe('performAction', () => {
        test('should perform an action on all managers', async () => {
            const event = createEvent('user123', context).event;
            const route = {
                path: '/example',
                component: ExampleComponent,
            };

            const manager1 = context.initRoute(route);

            route.path = '/another';
            const manager2 = context.initRoute(route);

            // spy on the performAction method of the managers
            jest.spyOn(manager1, 'performAction');
            jest.spyOn(manager2, 'performAction');

            await context.performAction(event);

            expect(manager1.performAction).toHaveBeenCalledWith(event);
            expect(manager2.performAction).toHaveBeenCalledWith(event);
        });
    });

    describe('mount and upgrade', () => {
        test('should mount and upgrade the user', async () => {
            const exampleMount = jest.fn();
            const exampleUpgrade = jest.fn();
            const exampleUnmount = jest.fn();
            const Example: Component = (ctx) => {
                ctx.onMount(exampleMount);
                ctx.onUpgrade(exampleUpgrade);
                ctx.onUnmount(exampleUnmount);

                return html`<div>Example</div>`;
            };

            const anotherMount = jest.fn();
            const anotherUpgrade = jest.fn();
            const Another: Component = (ctx) => {
                ctx.onMount(anotherMount);
                ctx.onUpgrade(anotherUpgrade);

                return html`<div>Another</div>`;
            };

            const thirdMount = jest.fn();
            const thirdUnmount = jest.fn();
            const Third: Component = (ctx) => {
                ctx.onMount(thirdMount);
                ctx.onUnmount(thirdUnmount);

                return html`<div>Third</div>`;
            };

            context.initRoute({
                path: '/example',
                component: Example,
            });

            context.initRoute({
                path: '/another',
                component: Another,
            });

            context.initRoute({
                path: '/third',
                component: Third,
            });

            const { req, res } = createMocks({
                method: 'GET',
                url: '/example',
                headers: {
                    host: 'localhost',
                },
            });

            await context.mountUser(req, res);

            // it only mounts the matching route
            expect(exampleMount).toHaveBeenCalled();
            expect(exampleUpgrade).not.toHaveBeenCalled();
            expect(anotherMount).not.toHaveBeenCalled();
            expect(thirdMount).not.toHaveBeenCalled();
            expect(thirdUnmount).not.toHaveBeenCalled();

            const { req: req1, res: res1 } = createMocks({
                method: 'GET',
                url: '/another',
                headers: {
                    host: 'localhost',
                },
            });

            // clear the mock calls
            exampleMount.mockClear();

            await context.mountUser(req1, res1);

            // it only mounts the matching route
            expect(exampleMount).not.toHaveBeenCalled();
            expect(exampleUpgrade).not.toHaveBeenCalled();
            expect(anotherMount).toHaveBeenCalled();
            expect(thirdMount).not.toHaveBeenCalled();
            expect(thirdUnmount).not.toHaveBeenCalled();

            // in order to upgrade, we need add the user to the context
            context.addUpgradingUser('user123', html`<div>Example</div>`);
            const client = createEvent('user123', context, '/example').event;

            // clear the mock calls
            anotherMount.mockClear();

            await context.upgradeUser(client);

            expect(exampleMount).not.toHaveBeenCalled();
            expect(exampleUpgrade).toHaveBeenCalled();
            expect(anotherMount).not.toHaveBeenCalled();
            expect(anotherUpgrade).not.toHaveBeenCalled();
            expect(thirdMount).not.toHaveBeenCalled();
            expect(thirdUnmount).not.toHaveBeenCalled();

            // clear the mock calls
            exampleUpgrade.mockClear();

            // in order to upgrade, we need add the user to the context
            context.addUpgradingUser('user123', html`<div>Another</div>`);
            const client1 = createEvent('user123', context, '/another').event;

            await context.upgradeUser(client1);

            expect(exampleMount).not.toHaveBeenCalled();
            expect(exampleUpgrade).not.toHaveBeenCalled();
            expect(anotherMount).not.toHaveBeenCalled();
            expect(anotherUpgrade).toHaveBeenCalled();
            expect(thirdMount).not.toHaveBeenCalled();
            expect(thirdUnmount).not.toHaveBeenCalled();

            // clear the mock calls
            anotherUpgrade.mockClear();

            context.unmountUser('user123');

            expect(exampleMount).not.toHaveBeenCalled();
            expect(exampleUpgrade).not.toHaveBeenCalled();
            // since the user was mounted and or upgraded, it will be unmounted
            expect(exampleUnmount).toHaveBeenCalled();
            expect(anotherMount).not.toHaveBeenCalled();
            expect(anotherUpgrade).not.toHaveBeenCalled();
            expect(thirdMount).not.toHaveBeenCalled();
            // this function would not be called because the user is not mounted
            expect(thirdUnmount).not.toHaveBeenCalled();
        });
    });
});

