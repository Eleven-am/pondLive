import { default_t, Subscription } from "../../pondbase";
export declare class PondLiveChannel {
    readonly topic: string;
    private _subscriberCount;
    private _data;
    private readonly _subject;
    private readonly _destroy;
    constructor(topic: string, destroy: () => void);
    assign(data: default_t): void;
    get data(): Readonly<default_t>;
    onComplete(callback: (data: any) => void): void;
    private _buildUnsubscribe;
    subscribe(event: string, callback: (data: default_t) => void): Subscription;
    subscribeAll(callback: (data: default_t) => void): Subscription;
    broadcast(event: string, data: default_t): void;
    destroy(): void;
}
export declare class PondLiveChannelManager {
    private readonly _channels;
    constructor();
    getChannel(topic: string): PondLiveChannel | null;
    createChannel(topic: string): PondLiveChannel;
    get channels(): import("../../pondbase").PondDocument<PondLiveChannel>[];
    broadcast(topic: string, event: string, data: default_t): void;
    subscribe(topic: string, event: string, callback: (data: default_t) => void): Subscription;
    subscribeAll(topic: string, callback: (data: default_t) => void): Subscription;
}
