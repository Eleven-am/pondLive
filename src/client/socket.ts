import {webSocket, WebSocketSubject} from "rxjs/webSocket";
import {ClientMessage, ServerEmittedMessage} from "../server/server";
import {BehaviorSubject, Observable, Subject, Subscription} from "rxjs";
import {filter} from 'rxjs/operators';
import {PondPresence} from "../server/channel";
import {BaseMap} from "../server/utils";

type PondParams = {
    [key: string]: string;
}

type ChannelParams = PondParams

type PondState = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';

declare global {
    interface Window {
        pond?: BaseMap<string, PondClientSocket>;
    }
}

export class PondClientSocket {
    private readonly address: URL;
    private socketState: PondState = 'CLOSED';
    private channels: BaseMap<string, Channel>;
    private subscription: Subscription | undefined;
    private socket: WebSocketSubject<ServerEmittedMessage | ClientMessage> | undefined;

    constructor(endpoint: string, params: PondParams) {
        const address = new URL(endpoint);
        const query = new URLSearchParams(params);
        address.search = query.toString();
        this.address = address;
        this.channels = new BaseMap();

        if (window.pond?.has(this.address.toString())) {
            window.pond.get(this.address.toString())?.disconnect();
            window.pond.set(this.address.toString(), this);

        } else {
            window.pond = window.pond || new BaseMap();
            window.pond.set(this.address.toString(), this);
        }
    }

    /**
     * @desc Connects to the server and returns the socket.
     */
    connect() {
        if (this.socketState !== 'CLOSED')
            return;

        this.socketState = 'CONNECTING';
        const windowPond = window.pond?.get(this.address.toString());

        const socket = windowPond?.socket || webSocket<ServerEmittedMessage | ClientMessage>({
            url: this.address.toString(),
            openObserver: {
                next: () => {
                    this.socketState = 'OPEN';
                }
            },
            closeObserver: {
                next: () => {
                    this.socketState = 'CLOSED';
                }
            },
            closingObserver: {
                next: () => {
                    this.socketState = 'CLOSING';
                }
            }
        });

        this.socket = socket;
        this.subscription = socket.subscribe();
        return this;
    }

    /**
     * @desc Returns the current state of the socket.
     */
    getState(): PondState {
        return this.socketState;
    }

    /**
     * @desc Creates a channel with the given name and params.
     * @param channel - The name of the channel.
     * @param params - The params to send to the server.
     */
    createChannel(channel: string, params: ChannelParams): Channel {
        if (this.channels.has(channel) && this.channels.get(channel)?.isActive)
            return this.channels.get(channel)!;

        const newChannel = new Channel(channel, params, this.socket!);
        this.channels.set(channel, newChannel);
        return newChannel;
    }

    /**
     * @desc Disconnects the socket from the server.
     */
    disconnect() {
        this.socket?.complete();
        this.socket?.unsubscribe();
        this.subscription?.unsubscribe();
        this.socket = undefined;
        this.channels = new BaseMap();
    }
}

class Channel {
    private readonly channel: string;
    private subscription: Subscription | undefined;
    private readonly socket: WebSocketSubject<ServerEmittedMessage | ClientMessage>;
    private readonly params: ChannelParams;
    private connectedSubject: BehaviorSubject<boolean>;
    private readonly subject: Subject<ServerEmittedMessage>;
    private readonly presenceSubject = new Subject<PondPresence[]>();

    constructor(channel: string, params: ChannelParams, socket: WebSocketSubject<ServerEmittedMessage | ClientMessage>) {
        this.channel = channel;
        this.params = params;
        this.socket = socket;
        this.connectedSubject = new BehaviorSubject<boolean>(false);
        this.subject = new Subject<ServerEmittedMessage>();
    }

    get isActive() {
        return !this.connectedSubject.isStopped;
    }

    /**
     * @desc Connects to the channel.
     */
    join() {
        if (this.connectedSubject.value)
            return;
        this.connectedSubject.next(true);
        const observable = this.init();
        this.subscription = observable
            .subscribe(message => {
                if (message.action === 'PRESENCE')
                    this.presenceSubject.next(message.payload.presence);

                else if (message.action === 'MESSAGE')
                    this.subject.next(message);

                else if (message.event === 'KICKED_FROM_CHANNEL')
                    this.leave();
            });
    }

    /**
     * @desc Disconnects from the channel.
     */
    leave() {
        this.connectedSubject.next(false);
        this.connectedSubject.complete();
        this.presenceSubject.complete();
        this.subscription?.unsubscribe();
        this.subscription = undefined;
        this.subject.complete();
    }

    /**
     * @desc Monitors the presence state of the channel.
     * @param callback - The callback to call when the presence state changes.
     */
    onPresenceUpdate(callback: (presence: PondPresence[]) => void) {
        this.presenceSubject.subscribe(callback);
    }

    /**
     * @desc Monitors the channel for messages.
     * @param callback - The callback to call when a message is received.
     */
    onMessage(callback: (event: string, message: any) => void) {
        this.subject
            .pipe(
                filter((message: ServerEmittedMessage) => message.action === 'MESSAGE'),
            )
            .subscribe(message => callback(message.event, message.payload));
    }

    /**
     * @desc Broadcasts a message to the channel, including yourself.
     * @param event - The event to send.
     * @param message - The message to send.
     */
    broadcast(event: string, message: any) {
        this.socket.next({
            action: 'BROADCAST',
            channelName: this.channel,
            event, payload: message
        });
    }

    /**
     * @desc Broadcasts a message to every other client in the channel except yourself.
     * @param event - The event to send.
     * @param message - The message to send.
     */
    broadcastFrom(event: string, message: any) {
        this.socket.next({
            action: 'BROADCAST_FROM',
            channelName: this.channel,
            event, payload: message
        });
    }

    /**
     * @desc Updates the presence state of the current client in the channel.
     * @param presence - The presence state to update.
     */
    updatePresence(presence: PondPresence) {
        this.socket.next({
            action: 'UPDATE_PRESENCE',
            channelName: this.channel,
            event: 'PRESENCE',
            payload: presence
        });
    }

    /**
     * @desc Sends a message to specific clients in the channel.
     * @param event - The event to send.
     * @param message - The message to send.
     * @param to - The clients to send the message to.
     */
    sendMessage(event: string, message: any, to: string[]) {
        this.socket.next({
            action: 'SEND_MESSAGE_TO_USER',
            channelName: this.channel,
            event, payload: message,
            addresses: to
        });
    }

    /**
     * @desc Listens for the connections state of the channel.
     * @param callback - The callback to call when the connection state changes.
     */
    onConnectionChange(callback: (connected: boolean) => void) {
        this.connectedSubject.subscribe(callback);
    }

    /**
     * @desc Initializes the channel.
     * @private
     */
    private init(): Observable<ServerEmittedMessage> {
        const observable: Observable<ServerEmittedMessage | ClientMessage> = this.socket.multiplex(
            () => ({
                action: 'JOIN_CHANNEL',
                channelName: this.channel,
                event: 'JOIN_CHANNEL',
                payload: this.params,
            }),
            () => ({
                action: 'LEAVE_CHANNEL',
                channelName: this.channel,
                event: 'LEAVE_CHANNEL',
                payload: this.params
            }),
            message => message.channelName === this.channel
        );
        return observable as Observable<ServerEmittedMessage>;
    }
}
