import { default_t, EventPubSub, PondBase, Subscription } from "../../pondbase";

export class PondLiveChannel {
    public readonly topic: string;
    private _subscriberCount: number;
    private _data: default_t;
    private readonly _subject: EventPubSub<default_t, void>;
    private readonly _destroy: () => void;

    constructor(topic: string, destroy: () => void) {
        this.topic = topic;
        this._subscriberCount = 0;
        this._data = {};
        this._subject = new EventPubSub();
        this._destroy = destroy;
    }

    public assign(data: default_t) {
        this._data = Object.assign(this._data, data);
    }

    public get data(): Readonly<default_t> {
        const result  = {...this._data};
        return Object.freeze(result);
    }

    public onComplete(callback: (data: any) => void) {
        this._subject.onComplete(() => {
            callback(this._data);
        });
    }

    private _buildUnsubscribe(subscription: Subscription): Subscription {
        return {
            unsubscribe: () => {
                subscription.unsubscribe();
                this._subscriberCount--;
                if (this._subscriberCount === 0)
                    this.destroy();
            }
        }
    }

    public subscribe(event: string, callback: (data: default_t) => void) {
        this._subscriberCount++;
        const unsubscribe = this._subject.subscribe(event, callback);
        return this._buildUnsubscribe(unsubscribe);
    }

    public subscribeAll(callback: (data: default_t) => void) {
        this._subscriberCount++;
        const unsubscribe = this._subject.subscribeAll(callback);
        return this._buildUnsubscribe(unsubscribe);
    }

    public broadcast(event: string, data: default_t) {
        this._subject.publish(event, data);
    }

    public destroy() {
        this._subject.complete();
        this._destroy();
    }
}

export class PondLiveChannelManager {
    private readonly _channels: PondBase<PondLiveChannel>;

    constructor() {
        this._channels = new PondBase();
    }

    public getChannel(topic: string): PondLiveChannel | null {
        return this._channels.find(channel => channel.topic === topic)?.doc || null;
    }

    public createChannel(topic: string): PondLiveChannel {
        return this._channels.createDocument(doc => {
            return new PondLiveChannel(topic, doc.removeDoc.bind(doc));
        }).doc;
    }

    get channels() {
        return this._channels.toArray();
    }

    public broadcast(topic: string, event: string, data: default_t) {
        const channel = this.getChannel(topic);
        if (channel)
            channel.broadcast(event, data);
    }

    public subscribe(topic: string, event: string, callback: (data: default_t) => void): Subscription {
        const channel = this.getChannel(topic) || this.createChannel(topic);
        return channel.subscribe(event, callback);
    }

    public subscribeAll(topic: string, callback: (data: default_t) => void): Subscription {
        const channel = this.getChannel(topic) || this.createChannel(topic);
        return channel.subscribeAll(callback);
    }
}
