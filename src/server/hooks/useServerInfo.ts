import { LiveContext } from '../context/liveContext';

interface ServerInfo<T> {
    getState: () => T;
    setState: (newState: T) => void;
    subscribe: (userId: string, callback: (userId: string, newState: T) => void) => void;
}

interface ServerContext<T> extends Omit<ServerInfo<T>, 'setState' | 'getState'> {
    setState: (newState: T, userId: string) => void;
    getState: (userId: string) => T;
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
    };
};

export const createClientContext = <T> (initialState: T): ServerContext<T> => {
    const state: Map<string, T> = new Map();
    const subscribers: Record<string, (userId: string, newState: any) => void> = {};

    return {
        getState: (userId) => {
            if (!state.has(userId)) {
                state.set(userId, initialState);
            }

            return state.get(userId) as T;
        },
        setState: (newState, userId) => {
            state.set(userId, newState);

            const callback = subscribers[userId];

            if (callback) {
                return callback(userId, newState);
            }
        },
        subscribe: (userId, callback) => {
            subscribers[userId] = callback;
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
