import {Channel} from "../../pondsocket";

export declare class LiveSocket<LiveContext extends Object> {
    readonly clientId: string;

    /**
     * @desc Checks it the current context is a websocket connection.
     */
    get isWebsocket(): boolean;

    /**
     * @desc Gets the live context.
     */
    get context(): Readonly<LiveContext>;

    /**
     * @desc This method is called when a websocket connection is established ont his context.
     * @param channel - The channel that was created.
     */
    upgradeToWebsocket(channel: Channel): void;

    /**
     * @desc This method is called when the websocket connection is closed.
     */
    downgrade(): void;

    /**
     * @desc Gets a specific pub/sub channel from the pond.
     * @param name - The name of the channel.
     */
    getChannel(name: string): import("./pondLiveChannel").PondLiveChannel | null;

    /**
     * @desc Assigns data to the current context.
     * @param assigns - The data to assign.
     */
    assign(assigns: Partial<LiveContext>): void;

    /**
     * @desc Assigns data to a pub/sub channel.
     * @param name - The name of the channel.
     * @param assigns - The data to assign.
     */
    assignToChannel<AssignData extends Object>(name: string, assigns: AssignData): void;

    /**
     * @desc Broadcasts data to a pub/sub channel.
     * @param channel - The name of the channel.
     * @param event - The event name.
     * @param data - The data to broadcast.
     */
    broadcast<BroadcastData>(channel: string, event: string, data: BroadcastData): void;

    /**
     * @desc Gets data assigned to a pub/sub channel.
     * @param name - The name of the channel.
     */
    getChannelData<AssignData>(name: string): AssignData | null;

    /**
     * @desc Subscribes to a pub/sub channel.
     * @param name - The name of the channel.
     * @param event - The event name.
     */
    subscribe(name: string, event: string): void;

    /**
     * @desc Unsubscribes from a pub/sub channel.
     * @param name - The name of the channel.
     */
    unsubscribe(name: string): void;

    /**
     * @desc Subscribes to all events on a pub/sub channel.
     * @param name - The name of the channel.
     */
    subscribeAll(name: string): void;

    /**
     * @desc Emits an event on the browser window.
     * @param event - The event name.
     * @param data - The data to emit.
     */
    emit<EmitData>(event: string, data: EmitData): void;
}
