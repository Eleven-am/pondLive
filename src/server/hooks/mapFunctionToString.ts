import { ServerEvent } from './useState';
import { Context } from '../context/context';
import { deepCompare } from '../helpers/helpers';

type MappedFunction<T> = (context: Context, event: ServerEvent, state: T) => void | Promise<void>;

export function mapFunctionToString<T> (context: Context) {
    const { addDispatcher, key, args } = context.hookDispatcher<T>();

    return (newArg: T, setStateFn: MappedFunction<T>) => {
        const arg = args.find((arg) => deepCompare(arg.value, newArg));

        if (arg) {
            return arg.key;
        }

        const string = Math.random()
            .toString(36)
            .substring(7);

        args.push({
            key: `${key}-${string}`,
            value: newArg,
        });

        return addDispatcher(string, (context, event) => setStateFn(context, event, newArg));
    };
}
