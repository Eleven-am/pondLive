import { PondChannel } from "../../socket/pondChannel";
import { ComponentManager } from "../componentManager";
import { Channel } from "../../socket/channel";
import { PondChannelData } from "../../types";
export declare class LiveSocket<LiveContext> {
    private _liveContext;
    readonly clientId: string;
    private readonly _pond;
    private _channel;
    private readonly _manager;
    private readonly _subscriptions;
    constructor(clientId: string, pond: PondChannel, manager: ComponentManager);
    set channel(channel: Channel);
    getChannel(name: string): Channel | null;
    get context(): LiveContext;
    assign(assigns: Partial<LiveContext>): void;
    assignToChannel<AssignData extends PondChannelData>(name: string, assigns: AssignData): void;
    broadcast<BroadcastData>(channel: string, event: string, data: BroadcastData): void;
    getChannelData<AssignData>(name: string): AssignData | null;
    subscribe(name: string): void;
    unsubscribe(name: string): void;
}
