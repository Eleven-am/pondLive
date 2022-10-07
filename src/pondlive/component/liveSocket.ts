import { ComponentManager } from "../componentManager";
import { LiveRouter } from "./liveRouter";
import { PondError, Subscription } from "../../pondbase";
import { PondLiveChannelManager } from "./pondLiveChannel";
import { Channel, ResponseResolver, PondResponse } from "../../pondsocket";

export class LiveSocket<LiveContext extends Object> {
    private _liveContext: LiveContext;
    public readonly clientId: string;
    private _isWebsocket: boolean;
    private readonly _pond: PondLiveChannelManager;
    private _channel: Channel | null;
    private readonly _manager: ComponentManager;
    private readonly _remove: () => void;
    private _subscriptions: {name: string, sub: Subscription}[];

    constructor(clientId: string, pond: PondLiveChannelManager, manager: ComponentManager, remove: () => void) {
        this._liveContext = {} as LiveContext;
        this.clientId = clientId;
        this._pond = pond;
        this._subscriptions = [];
        this._manager = manager;
        this._channel = null;
        this._isWebsocket = false;
        this._remove = remove;
    }

    /**
     * @desc This method is called when a websocket connection is established ont his context.
     * @param channel - The channel that was created.
     */
    upgradeToWebsocket(channel: Channel): void {
        this._isWebsocket = true;
        this._channel = channel;
    }

    /**
     * @desc This method is called when the websocket connection is closed.
     */
    downgrade(): void {
        this._isWebsocket = false;
        this._channel = null;
        this._subscriptions.forEach(s => s.sub.unsubscribe());
        this._subscriptions.length = 0;
    }

    /**
     * @desc Checks it the current context is a websocket connection.
     */
    get isWebsocket(): boolean {
        return this._isWebsocket;
    }

    /**
     * @desc Gets a specific pub/sub channel from the pond.
     * @param name - The name of the channel.
     */
    getChannel(name: string) {
        return this._pond.getChannel(name);
    }

    /**
     * @desc Gets the live context.
     */
    get context(): Readonly<LiveContext> {
        const result = {...this._liveContext};
        return Object.freeze(result);
    }

    /**
     * @desc Assigns data to the current context.
     * @param assigns - The data to assign.
     */
    assign(assigns: Partial<LiveContext>): void {
        this._liveContext = Object.assign(this._liveContext, assigns);
    }

    /**
     * @desc Assigns data to a pub/sub channel.
     * @param name - The name of the channel.
     * @param assigns - The data to assign.
     */
    assignToChannel<AssignData extends Object>(name: string, assigns: AssignData): void {
        const channel = this.getChannel(name);
        if (channel)
            channel.assign(assigns);
    }

    /**
     * @desc Broadcasts data to a pub/sub channel.
     * @param channel - The name of the channel.
     * @param event - The event name.
     * @param data - The data to broadcast.
     */
    broadcast<BroadcastData>(channel: string, event: string, data: BroadcastData): void {
        const payload = {
            ...data,
            sender: this.clientId
        }
        this._pond.broadcast(channel, event, payload);
    }

    /**
     * @desc Gets data assigned to a pub/sub channel.
     * @param name - The name of the channel.
     */
    getChannelData<AssignData>(name: string): AssignData | null {
        const channel = this.getChannel(name);
        if (channel)
            return channel.data as AssignData;

        return null;
    }

    /**
     * @desc Subscribes to a pub/sub channel.
     * @param name - The name of the channel.
     * @param event - The event name.
     */
    subscribe(name: string, event: string): void {
        const sub = this._pond.subscribe(name, event,async data => {
            if (data.sender !== this.clientId) {
                const response = this._createPondResponse();
                const router = new LiveRouter(response);
                const info = data?.payload || data;
                await this._manager.handleInfo(info, this, router, response);
            }
        });

        this._subscriptions.push({name: name, sub: sub});
    }

    /**
     * @desc Unsubscribes from a pub/sub channel.
     * @param name - The name of the channel.
     */
    unsubscribe(name: string): void {
        const subs = this._subscriptions.filter(s => s.name === name);
        this._subscriptions = this._subscriptions.filter(s => s.name !== name);
        subs.forEach(s => s.sub.unsubscribe());
    }

    /**
     * @desc Subscribes to all events on a pub/sub channel.
     * @param name - The name of the channel.
     */
    subscribeAll(name: string): void {
        const sub = this._pond.subscribeAll(name, async data => {
            if (data.sender !== this.clientId) {
                const response = this._createPondResponse();
                const router = new LiveRouter(response);
                const info = data?.payload || data;
                await this._manager.handleInfo(info, this, router, response);
            }
        });

        this._subscriptions.push({name: name, sub: sub});
    }

    /**
     * @desc Emits an event on the browser window.
     * @param event - The event name.
     * @param data - The data to emit.
     */
    emit<EmitData>(event: string, data: EmitData): void {
        if (this._channel)
            this._channel.broadcast('emit', {event, data});
    }

    destroy(): void {
        this._subscriptions.forEach(s => s.sub.unsubscribe());
        this._subscriptions.length = 0;
        this._remove();
    }

    createResponse() {
        const response = this._createPondResponse();
        const router = new LiveRouter(response);

        return {response, router};
    }

    private _createPondResponse(): PondResponse {
        if (!this._channel)
            throw new PondError("Cannot create a pond response without a websocket.", 500, "PondError");

        const assigns = {
            assigns: {},
            presence: {},
            channelData: {}
        }

        const resolver = (data: ResponseResolver) => {
            if (data.error)
                throw new PondError(data.error.errorMessage, data.error.errorCode, 'PondError');

            else if (data.message && this._channel)
                this._channel.broadcast(data.message.event, data.message.payload);

            return;
        }

        return new PondResponse(this._channel, assigns, resolver);
    }
}
