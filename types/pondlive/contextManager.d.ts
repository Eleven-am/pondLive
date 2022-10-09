import {ComponentManager} from "./componentManager";
import {LiveSocket} from "./component/liveSocket";

export interface PeakData<DataType> {
    contextId: string;
    data: Readonly<DataType>;
}

export declare type ContextConsumer<ContextType> = {
    assign: (socket: LiveSocket<any>, assigns: Partial<ContextType>) => void;
    get: (socket: LiveSocket<any>) => Readonly<ContextType>;
    handleContextChange: (context: PeakData<any>, handler: (data: Readonly<ContextType>) => void) => void;
};
export declare type ContextProvider = {
    subscribe: (manager: ComponentManager) => void;
    deleteClient: (socket: LiveSocket<any>) => void;
    getData: (socket: LiveSocket<any>) => PeakData<any>;
};

declare type ContextFactoryType<ContextType> = [ContextConsumer<ContextType>, ContextProvider];

export declare function createContext<ContextType extends Object>(initialValue: ContextType): ContextFactoryType<ContextType>;

export {};
