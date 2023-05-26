import { mapFunctionToString } from './mapFunctionToString';
import { Context } from '../context/context';
import { ServerEvent } from '../wrappers/serverEvent';

type SetState<T> = (state: (T | ((state: T, event: ServerEvent) => T | Promise<T>))) => string;

export interface Args<T> {
    key: string;
    value: (T | ((state: T, event: ServerEvent) => T | Promise<T>));
}

type CreatedState<T> = [T, SetState<T>];

export function useState<T> (context: Context, initialState: T): CreatedState<T> {
    const { getState, setState } = context.getHook<T>();
    const mapper = mapFunctionToString<(T | ((state: T, event: ServerEvent) => T | Promise<T>))>(context);

    const state = getState(context.userId, initialState);

    const setStateFn = async (context: Context, event: ServerEvent, state: (T | ((state: T, event: ServerEvent) => T | Promise<T>))) => {
        let newState: T;
        const currentState = getState(event.userId, initialState);

        if (typeof state === 'function') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            newState = await state(currentState, event);
        } else {
            newState = state;
        }

        setState(context, newState);
    };

    const setStateWrapper = (state: (T | ((state: T, event: ServerEvent) => T | Promise<T>))) => mapper(state, setStateFn);

    return [state, setStateWrapper];
}
