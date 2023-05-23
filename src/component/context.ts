import { Html } from '../parser/parser';
import { Request } from '../wrappers/request';
import { Response } from '../wrappers/response';

declare class Broadcast<T> {}


interface State<T> {
    getContext: () => T;
    assign: (data: Partial<T>) => void;
}

interface Socket<T> extends State<T> {
    emit: <U>(event: string, data: U) => void;
    subscribe: (broadcast: Broadcast<any>) => void;
    setPageTitle: (title: string) => void;
    navigateTo: (url: string) => void;
}

interface Context<T> {
    onMount: (callback: (request: Request, response: Response, state: State<T>) => void) => void;
    onUnmount: (callback: (socket: Socket<T>) => void) => void;
    onUpgrade: (callback: (socket: Socket<T>) => void) => void;
    onEvent: (callback: (event: any) => void) => void;
    onBroadcast: <U>(broadcast: Broadcast<U>, callback: (data: U) => void) => void;
    slot: () => Html;
    props: any;
}

type Component<T> = (props: Context<T>) => Html;

