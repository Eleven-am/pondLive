import { LiveContext } from '../context/liveContext';
import { ServerEvent } from '../wrappers/serverEvent';

type Action<T> = Record<string, (event: ServerEvent, prev: T) => T | Promise<T>>;
type RunAction<T> = (event: keyof T) => string;
type CreatedAction<T, A extends Action<T>> = [T, RunAction<A>]

export function useAction<T, A extends Action<T>> (context: LiveContext, initialState: T, actions: A): CreatedAction<T, A> {
    const { setState, getState, addDispatcher } = context.setUpHook(initialState, 'useAction');

    async function performAction (type: keyof A, event: ServerEvent) {
        const action = actions[type];
        const state = getState(event.userId);

        if (!action) {
            return;
        }

        const newState = await action(event, state);

        setState(newState, event.userId);
    }

    const runAction = (type: keyof A) => addDispatcher(type, (event) => performAction(type, event));

    return [getState(context.userId), runAction];
}
