import { LiveContext } from '../context/liveContext';
import { Request } from '../wrappers/request';
import { ServerEvent } from '../wrappers/serverEvent';

export type HookContext = LiveContext | ServerEvent | Request;
type Effect<T> = (change: T) => (() => void) | Promise<(() => void)> | void | Promise<void>;
type CreatedInfo<T> = [T, (context: HookContext, newState: Partial<T>) => void, (effect: Effect<T>) => void]

interface ServerInfo<T> {
    getState: () => T;
    assign: (context: HookContext, newState: Partial<T>) => void;
    addEffect: (context: HookContext, identifier: string, effect: Effect<T>) => void;
    subscribe: (userId: string, callback: (userId: string, newState: T) => void) => void;
    setState: (context: HookContext, setter: (state: T) => T) => void;
    deleteEffect: (userId: string, identifier: string) => void;
}

interface ServerContext<T> extends Omit<ServerInfo<T>, 'getState'> {
    getState: (context: HookContext) => T;
    destroy: (context: HookContext) => void;
}

export const createServerInfo = <T> (initialState: T): ServerInfo<T> => {
    let state = initialState;
    const subscribers: Record<string, (userId: string, newState: any) => void> = {};
    const effects: Record<string, Record<string, Effect<T>>> = {};
    let cleanup: (() => void)[] = [];

    const modifyState = async (ctx: HookContext, newState: Partial<T>) => {
        state = {
            ...state,
            ...newState,
        };

        cleanup.forEach((x) => x());

        const promises = Object.keys(effects).map((userId) => effects[userId])
            .map((x) => Object.keys(x).map((key) => x[key](state)))
            .flat();

        cleanup = (await Promise.all(promises)).filter((x) => x) as (() => void)[];

        Object.keys(subscribers).forEach((userId) => {
            subscribers[userId](userId, state);
        });
    };

    return {
        getState: () => state,
        subscribe: (userId, callback) => {
            subscribers[userId] = callback;
        },
        assign: (ctx, newState) => {
            void modifyState(ctx, newState);
        },
        addEffect: (ctx, identifier, effect) => {
            effects[ctx.userId] = {
                ...effects[ctx.userId],
                [identifier]: effect,
            };
        },
        setState: (ctx, setter) => {
            void modifyState(ctx, setter(state));
        },
        deleteEffect: (userId, identifier) => {
            if (!effects[userId]) {
                return;
            }

            delete effects[userId][identifier];
        },
    };
};

export const createClientContext = <T> (initialState: T): ServerContext<T> => {
    const state: Map<string, T> = new Map();
    const subscribers: Record<string, (userId: string, newState: any) => void> = {};
    const effects: Record<string, Record<string, Effect<T>>> = {};
    const cleanup: Record<string, (() => void)[]> = {};

    const modifyState = async (ctx: HookContext, newState: Partial<T>) => {
        const currentState = state.get(ctx.userId) as T;

        state.set(ctx.userId, {
            ...currentState,
            ...newState,
        });

        if (cleanup[ctx.userId]) {
            cleanup[ctx.userId].forEach((x) => x());
        }

        const effect = effects[ctx.userId];
        const callback = subscribers[ctx.userId];

        if (effect) {
            const promises = Object.keys(effect).map((key) => effect[key](state.get(ctx.userId) as T));

            cleanup[ctx.userId] = (await Promise.all(promises)).filter((x) => x) as (() => void)[];
        }

        if (callback) {
            return callback(ctx.userId, state.get(ctx.userId) as T);
        }
    };

    return {
        getState: (context) => {
            if (!state.has(context.userId)) {
                state.set(context.userId, initialState);
            }

            return state.get(context.userId) as T;
        },
        subscribe: (userId, callback) => {
            subscribers[userId] = callback;
        },
        destroy: (context) => {
            state.delete(context.userId);
            delete subscribers[context.userId];
            delete effects[context.userId];
        },
        assign: (context, newState) => {
            void modifyState(context, newState);
        },
        addEffect: (context, identifier, effect) => {
            effects[context.userId] = {
                ...effects[context.userId],
                [identifier]: effect,
            };
        },
        setState: (context, setter) => {
            void modifyState(context, setter(state.get(context.userId) ?? initialState));
        },
        deleteEffect: (userId, identifier) => {
            if (!effects[userId]) {
                return;
            }

            delete effects[userId][identifier];
        },
    };
};


export function useServerInfo <T> (context: LiveContext, serverInfo: ServerInfo<T> | ServerContext<T>): CreatedInfo<T> {
    const { getState, assign, subscribe, addEffect, deleteEffect } = serverInfo;
    const { hookKey, onUnMount } = context.setUpHook();

    const state = getState(context);

    if (!context.isBuilt) {
        return [state, () => {}, () => {}];
    }

    subscribe(context.userId, () => context.reload());

    onUnMount(context.userId, () => deleteEffect(context.userId, hookKey));

    const effect = addEffect.bind(null, context, hookKey);

    return [state, assign, effect];
}
