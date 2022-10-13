import {LiveSocket} from "../component/liveSocket";
import {ComponentManager} from "../componentManager";

export interface PeakData<DataType = any> {}

export declare class ContextConsumer<ContextType> {
    assign: (socket: LiveSocket<any>, assigns: Partial<ContextType>) => void;
    get: (socket: LiveSocket<any>) => Readonly<ContextType>;
    handleContextChange: (context: PeakData, handler: (data: Readonly<ContextType>) => void) => void;
}

export declare class ContextProvider {
    mount: (socket: LiveSocket<any>, componentId: string) => void;
    subscribe: (manager: ComponentManager) => void;
}

export declare type GlobalContext<ContextData> = [ContextConsumer<ContextData>, ContextProvider];

export declare function createContext<ContextData>(initialData: ContextData): GlobalContext<ContextData>;
