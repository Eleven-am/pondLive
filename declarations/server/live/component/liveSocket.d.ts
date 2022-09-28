import { PondChannel } from "../../socket/pondChannel";
import { ComponentManager } from "../componentManager";
import { Channel } from "../../socket/channel";
export declare class LiveSocket<LiveContext> {
    readonly clientId: string;
    constructor(clientId: string, pond: PondChannel, manager: ComponentManager);
    set channel(channel: Channel);
    getChannel(name: string): Channel | null;
    get context(): LiveContext;
    assign(assigns: Partial<LiveContext>): void;
    assignToChannel<AssignData>(name: string, assigns: AssignData): void;
    broadcast<BroadcastData>(channel: string, event: string, data: BroadcastData): void;
    getChannelData<AssignData>(name: string): AssignData | null;
    subscribe(name: string): void;
    unsubscribe(name: string): void;
}
