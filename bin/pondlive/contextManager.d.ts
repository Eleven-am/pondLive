import {ComponentManager} from "./componentManager";
import {LiveSocket} from "./component/liveSocket";

interface PeakData<DataType> {
    name: string;
    data: DataType;
}

export declare class ContextConsumer<ContextType> {
    assign: (socket: LiveSocket<any>, assigns: Partial<ContextType>) => void;
    get: (socket: LiveSocket<any>) => Readonly<ContextType>;
}

export declare class ContextProvider {
    subscribe: (manager: ComponentManager) => void;
    deleteClient: (socket: LiveSocket<any>) => void;
    getData: (socket: LiveSocket<any>) => PeakData<any> | null;
}

declare type ContextFactoryType<ContextType> = [ContextConsumer<ContextType>, ContextProvider];

export declare function createContext<ContextType extends Object>(contextId: string): ContextFactoryType<ContextType>;

export {};
