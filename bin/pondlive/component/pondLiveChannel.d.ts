import {default_t, Subscription} from "../../pondbase";

export declare class PondLiveChannel {
    readonly topic: string;

    get data(): Readonly<default_t>;

    assign(data: default_t): void;

    onComplete(callback: (data: any) => void): void;

    subscribe(event: string, callback: (data: default_t) => void): Subscription;

    subscribeAll(callback: (data: default_t) => void): Subscription;

    broadcast(event: string, data: default_t): void;

    destroy(): void;
}

export declare class PondLiveChannelManager {

    get channels(): import("../../pondbase").PondDocument<PondLiveChannel>[];

    getChannel(topic: string): PondLiveChannel | null;

    createChannel(topic: string): PondLiveChannel;

    broadcast(topic: string, event: string, data: default_t): void;

    subscribe(topic: string, event: string, callback: (data: default_t) => void): Subscription;

    subscribeAll(topic: string, callback: (data: default_t) => void): Subscription;
}
