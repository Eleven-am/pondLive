import { ServerEvent, useState } from './useState';
import { Context } from '../context/context';

type Action<T> = Record<string, (event: ServerEvent) => T | Promise<T>>;
type RunAction<T> = (event: keyof T) => string;
type CreatedAction<T extends Action<any>> = [ReturnType<T[keyof T]> | null, RunAction<T>]

export function useAction<T extends Action<any>> (context: Context, actions: T): CreatedAction<T> {
    const [state, setState] = useState<ReturnType<T[keyof T]> | null>(context, null);

    function performAction (type: keyof T, event: ServerEvent) {
        const action = actions[type];

        if (!action) {
            return null;
        }

        return action(event);
    }

    function mutate (type: keyof T) {
        return setState((state, event) => performAction(type, event) ?? state);
    }

    return [state, mutate];
}
