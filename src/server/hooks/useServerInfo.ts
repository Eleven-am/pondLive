import { LiveContext } from '../context/liveContext';
import { Request } from '../wrappers/request';
import { ServerEvent } from '../wrappers/serverEvent';

export type HookContext = LiveContext | ServerEvent | Request;

interface ServerInfo<T> {
    getState: () => T;
    assign: (context: HookContext, newState: Partial<T>) => void;
    addEffect: (context: HookContext, effect: (change: T) => void | Promise<void>) => void;
    subscribe: (userId: string, callback: (userId: string, newState: T) => void) => void;
}

interface ServerContext<T> extends Omit<ServerInfo<T>, 'getState'> {
    getState: (context: HookContext) => T;
    destroy: (context: HookContext) => void;
}

type CreatedInfo<T> = [T, (context: HookContext, newState: Partial<T>) => void, (effect: (change: T) => void | Promise<void>) => void];

export const createServerInfo = <T> (initialState: T): ServerInfo<T> => {
    let state = initialState;
    const subscribers: Record<string, (userId: string, newState: any) => void> = {};
    const effects: Record<string, (change: T) => void | Promise<void>> = {};

    const modifyState = async (ctx: HookContext, newState: Partial<T>) => {
        state = {
            ...state,
            ...newState,
        };

        const promises = Object.keys(effects).map((userId) => effects[userId](state));

        await Promise.all(promises);

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
        addEffect: (ctx, effect) => {
            effects[ctx.userId] = effect;
        },
    };
};

export const createClientContext = <T> (initialState: T): ServerContext<T> => {
    const state: Map<string, T> = new Map();
    const subscribers: Record<string, (userId: string, newState: any) => void> = {};
    const effects: Record<string, (change: T) => void | Promise<void>> = {};

    const modifyState = async (ctx: HookContext, newState: Partial<T>) => {
        const currentState = state.get(ctx.userId) as T;

        state.set(ctx.userId, {
            ...currentState,
            ...newState,
        });

        const effect = effects[ctx.userId];
        const callback = subscribers[ctx.userId];

        if (effect) {
            await effect(state.get(ctx.userId) as T);
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
        addEffect: (context, effect) => {
            effects[context.userId] = effect;
        },
    };
};


export function useServerInfo <T> (context: LiveContext, serverInfo: ServerInfo<T> | ServerContext<T>): CreatedInfo<T> {
    const { getState, assign, subscribe, addEffect } = serverInfo;

    const state = getState(context);

    if (!context.isBuilt) {
        return [state, () => {}, () => {}];
    }

    subscribe(context.userId, () => context.reload());

    const effect = addEffect.bind(null, context);

    return [state, assign, effect];
}
