import {Subscription} from "../../pondbase";
import {LiveSocket} from "../component/liveSocket";

export interface BroadcastEvent<ContextType extends Object = any> {
    event: string;
    payload: ContextType;
}

export declare class Broadcaster<ContextType extends Object, InnerData extends Object = any> {
    constructor(initialData: InnerData);

    /**
     * @desc The data of the broadcaster.
     */
    get channelData(): Readonly<InnerData>;

    /**
     * @desc Assigns a value to the broadcaster.
     * @param assigns - The data to assign.
     */
    assign(assigns: Partial<InnerData>): void;

    /**
     * #desc Subscribes to a broadcast event.
     * @param socket - The socket of the user connection.
     */
    subscribe(socket: LiveSocket<any>): Subscription;

    /**
     * @desc Broadcasts an event to all subscribers.
     * @param payload - The data to broadcast.
     */
    broadcast(payload: ContextType): void;

    /**
     * @desc Broadcasts an event to all subscribers except the sender.
     * @param socket - The socket of the sender.
     * @param payload - The data to broadcast.
     */
    broadcastFrom(socket: LiveSocket<any>, payload: ContextType): void;

    /**
     * @desc Interprets a broadcast event.
     * @param data - The data to interpret.
     * @param callback - The callback to call when the event is interpreted.
     */
    handleEvent(data: BroadcastEvent, callback: (payload: ContextType) => void): void;
}
