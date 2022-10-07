import {PondBase} from "../pondbase";
import {ComponentManager} from "./componentManager";
import {LiveSocket} from "./component/liveSocket";

interface ContextManagerDB<DataType> {
    clientId: string;
    data: DataType;
}

interface PeakData<DataType> {
    name: string;
    data: DataType;
}

export class ContextManager<ContextType> {
    private readonly _name: string;
    private readonly _database: PondBase<ContextManagerDB<ContextType>>;
    private readonly _managers: Set<ComponentManager>;

    constructor(name: string) {
        this._name = name;
        this._database = new PondBase<ContextManagerDB<ContextType>>();
        this._managers = new Set<ComponentManager>();
    }

    public subscribe(manager: ComponentManager) {
        this._managers.add(manager);
    }

    public assign(socket: LiveSocket<any>, assigns: Partial<ContextType>) {
        const db = this._database.find(doc => doc.clientId === socket.clientId);
        let newDoc: ContextType;
        if (db) {
            newDoc = Object.assign(db.doc.data, assigns);
            db.updateDoc({clientId: db.doc.clientId, data: newDoc});
        } else {
            newDoc = {...assigns} as ContextType;
            this._database.set({clientId: socket.clientId, data: newDoc});
        }

        this._managers.forEach(manager => manager.handleContextChange(newDoc, this._name, socket.clientId));
    }

    public get(socket: LiveSocket<any>): Readonly<ContextType> {
        const db = this._database.find(doc => doc.clientId === socket.clientId);
        if (db) {
            const data = {...db.doc.data};
            return Object.freeze(data);
        }

        return {} as ContextType;
    }

    public deleteClient(socket: LiveSocket<any>) {
        const doc = this._database.find(doc => doc.clientId === socket.clientId);
        if (doc)
            doc.removeDoc();
    }

    public getData(socket: LiveSocket<any>): PeakData<ContextType> | null{
        const db = this._database.find(doc => doc.clientId === socket.clientId);
        if (db) {
            const data = {...db.doc.data};
            return {name: this._name, data: Object.freeze(data)};
        }

        return null;
    }
}

export type ContextConsumer<ContextType> = {
    assign: (socket: LiveSocket<any>, assigns: Partial<ContextType>) => void;
    get: (socket: LiveSocket<any>) => Readonly<ContextType>;
}

export type ContextProvider = {
    subscribe: (manager: ComponentManager) => void;
    deleteClient: (socket: LiveSocket<any>) => void;
    getData: (socket: LiveSocket<any>) => PeakData<any> | null;
}

type ContextFactoryType<ContextType> = [ContextConsumer<ContextType>, ContextProvider]

export function createContext<ContextType>(contextId: string): ContextFactoryType<ContextType> {
    const contextManager = new ContextManager<ContextType>(contextId);
    return [
        {
            assign: contextManager.assign.bind(contextManager),
            get: contextManager.get.bind(contextManager)
        },
        {
            subscribe: contextManager.subscribe.bind(contextManager),
            deleteClient: contextManager.deleteClient.bind(contextManager),
            getData: contextManager.getData.bind(contextManager)
        }
    ];
}
