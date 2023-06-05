import { LiveContext } from '../context/liveContext';
import { Request } from '../wrappers/request';
import { ServerEvent } from '../wrappers/serverEvent';

export type HookContext = LiveContext | ServerEvent | Request;

interface ServerInfo<T> {
    getState: () => T;
    setState: (newState: T) => void;
    assign: (newState: Partial<T>) => void;
    subscribe: (userId: string, callback: (userId: string, newState: T) => void) => void;
}

interface ServerContext<T> extends Omit<ServerInfo<T>, 'setState' | 'getState' | 'assign'> {
    setState: (context: HookContext, newState: T) => void;
    getState: (context: HookContext) => T;
    destroy: (context: HookContext) => void;
    assign: (context: HookContext, newState: Partial<T>) => void;
}

export const createServerInfo = <T> (initialState: T): ServerInfo<T> => {
    let state = initialState;
    const subscribers: Record<string, (userId: string, newState: any) => void> = {};

    return {
        getState: () => state,
        setState: (newState) => {
            state = newState;

            Object.keys(subscribers).forEach((userId) => {
                subscribers[userId](userId, newState);
            });
        },
        subscribe: (userId, callback) => {
            subscribers[userId] = callback;
        },
        assign: (newState) => {
            state = {
                ...state,
                ...newState,
            };

            Object.keys(subscribers).forEach((userId) => {
                subscribers[userId](userId, state);
            });
        },
    };
};

export const createClientContext = <T> (initialState: T): ServerContext<T> => {
    const state: Map<string, T> = new Map();
    const subscribers: Record<string, (userId: string, newState: any) => void> = {};

    return {
        getState: (context) => {
            if (!state.has(context.userId)) {
                state.set(context.userId, initialState);
            }

            return state.get(context.userId) as T;
        },
        setState: (context, newState) => {
            state.set(context.userId, newState);

            const callback = subscribers[context.userId];

            if (callback) {
                return callback(context.userId, newState);
            }
        },
        subscribe: (userId, callback) => {
            subscribers[userId] = callback;
        },
        destroy: (context) => {
            state.delete(context.userId);
            delete subscribers[context.userId];
        },
        assign: (context, newState) => {
            const currentState = state.get(context.userId) as T;

            state.set(context.userId, {
                ...currentState,
                ...newState,
            });

            const callback = subscribers[context.userId];

            if (callback) {
                return callback(context.userId, state.get(context.userId) as T);
            }
        },
    };
};

export function useServerInfo <T> (context: LiveContext, serverInfo: ServerInfo<T>) {
    const { getState, subscribe } = serverInfo;

    if (!context.isBuilt) {
        return getState();
    }

    subscribe(context.userId, () => context.reload());

    return getState();
}
