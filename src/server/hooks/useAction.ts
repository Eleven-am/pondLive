import { LiveContext } from '../context/liveContext';
import { ServerEvent } from '../wrappers/serverEvent';

type Action<T> = Record<string, (event: ServerEvent, prev: T) => T | void | Promise<T> | Promise<void>>;
type RunAction<T> = (event: keyof T) => string;
type CreatedAction<T, A extends Action<T>> = [T, RunAction<A>]

export function useAction<T, A extends Action<T>> (context: LiveContext, initialState: T, actions: A): CreatedAction<T, A> {
    const { setState, getState, addDispatcher, deleteState, onUnMount } = context.setUpStateHook(initialState, 'useAction');

    async function performAction (type: keyof A, event: ServerEvent) {
        const action = actions[type];
        const state = getState(event.userId);

        if (!action) {
            return;
        }

        const newState = await action(event, state);

        if (newState) {
            setState(newState, event.userId);
        }
    }

    onUnMount(context.userId, () => deleteState(context.userId));

    const runAction = (type: keyof A) => addDispatcher(type, (event) => performAction(type, event));

    return [getState(context.userId), runAction];
}
