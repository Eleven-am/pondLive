import { LiveContext } from '../context/liveContext';
import { ServerEvent } from '../wrappers/serverEvent';

type SetState<T> = (state: (T | ((state: T, event: ServerEvent) => T | Promise<T>))) => string;
type CreatedState<T> = [T, SetState<T>];

export function useState<T> (context: LiveContext, initialState: T): CreatedState<T> {
    const { getState, setState, addDispatcher } = context.setUpHook<T>(initialState, 'useState');

    const state = getState();

    const setStateFn = async (state: (T | ((state: T, event: ServerEvent) => T | Promise<T>)), event: ServerEvent) => {
        let newState: T;

        if (typeof state === 'function') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            newState = await state(getState(), event);
        } else {
            newState = state;
        }

        setState(newState);
    };

    const mutate = (state: (T | ((state: T, event: ServerEvent) => T | Promise<T>))) => addDispatcher(state, (event) => setStateFn(state, event));

    return [state, mutate];
}
