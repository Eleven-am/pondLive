import { default_t } from "../../types";
import { Subscription } from "../../utils";
export declare class PondLiveChannel {
    readonly topic: string;
    constructor(topic: string, destroy: () => void);
    assign(data: default_t): void;
    get data(): default_t<any>;
    subscribe(event: string, callback: (data: default_t) => void): Subscription;
    subscribeAll(callback: (data: default_t) => void): Subscription;
    broadcast(event: string, data: default_t): void;
}
export declare class PondLiveChannelManager {
    constructor();
    getChannel(topic: string): PondLiveChannel | null;
    createChannel(topic: string): PondLiveChannel;
    get channels(): import("../../utils").PondDocument<PondLiveChannel>[];
    broadcast(topic: string, event: string, data: default_t): void;
    subscribe(topic: string, event: string, callback: (data: default_t) => void): Subscription;
    subscribeAll(topic: string, callback: (data: default_t) => void): Subscription;
}
