import { LiveContext } from '../context/liveContext';
import { ServerEvent } from '../wrappers/serverEvent';

type Action<T> = Record<string, (event: ServerEvent) => T | Promise<T>>;
type RunAction<T> = (event: keyof T) => string;
type CreatedAction<T extends Action<any>> = [ReturnType<T[keyof T]> | null, RunAction<T>]

export function useAction<T extends Action<any>> (context: LiveContext, actions: T): CreatedAction<T> {
    const { setState, getState, addDispatcher } = context.setUpHook<ReturnType<T[keyof T]> | null>(null, 'useAction');

    async function performAction (type: keyof T, event: ServerEvent) {
        const action = actions[type];

        if (!action) {
            return null;
        }

        const newState = await action(event);

        setState(newState);
    }

    const runAction = (type: keyof T) => addDispatcher(type, (event) => performAction(type, event));

    return [getState(), runAction];
}
