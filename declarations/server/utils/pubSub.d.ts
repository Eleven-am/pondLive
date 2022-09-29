export declare type Anything<A = any> = A | undefined | void | null;
export declare type Subscription = {
    unsubscribe: () => void;
};
export declare class Broadcast<T, A> {
    private _subscribers;
    /**
     * @desc Subscribe to the broadcast
     * @param handler - The handler to call when the broadcast is published
     */
    subscribe(handler: (data: T) => Anything<A>): Subscription;
    /**
     * @desc Publish to the broadcast
     * @param data - The data to publish
     */
    publish(data: T): Anything<A>;
}
export declare class Subject<T, A> extends Broadcast<T, A> {
    private _value;
    constructor(value: T);
    /**
     * @desc Get the current value of the subject
     */
    get value(): T | undefined;
    /**
     * @desc Subscribe to the subject
     */
    subscribe(handler: (data: T) => Anything<A>): Subscription;
    /**
     * @desc Publish to the subject
     */
    publish(data: T): Anything<A>;
}
