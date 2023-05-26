import { Context } from '../context/context';
import { deepCompare } from '../helpers/helpers';
import { ServerEvent } from '../wrappers/serverEvent';

type MappedFunction<T> = (context: Context, event: ServerEvent, state: T) => void | Promise<void>;

export function mapFunctionToString<T> (context: Context) {
    const { addDispatcher, key, args } = context.hookDispatcher<T>();

    return (newArg: T, setStateFn: MappedFunction<T>) => {
        const arg = args.find((arg) => deepCompare(arg.value, newArg));
        let newKey: string;

        if (arg) {
            newKey = arg.key;
        } else {
            newKey = `${key}-${Math.random()
                .toString(36)
                .substring(7)}`;

            args.push({
                key: newKey,
                value: newArg,
            });
        }

        return addDispatcher(newKey, (context, event) => setStateFn(context, event, newArg));
    };
}
