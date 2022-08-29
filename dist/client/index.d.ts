declare type PondParams = {
    [key: string]: string;
};

declare type PondPresence = {
    [key: string]: any
}

declare type ChannelParams = PondParams;

declare type PondState = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';

export default  class PondClientSocket {
    constructor(endpoint: string, params: PondParams);
    /**
     * @desc Connects to the server and returns the socket.
     */
    connect(): this | undefined;
    /**
     * @desc Returns the current state of the socket.
     */
    getState(): PondState;
    /**
     * @desc Creates a channel with the given name and params.
     * @param channel - The name of the channel.
     * @param params - The params to send to the server.
     */
    createChannel(channel: string, params: ChannelParams): Channel;
    /**
     * @desc Disconnects the socket from the server.
     */
    disconnect(): void;
}

export declare class Channel {
    get isActive(): boolean;
    /**
     * @desc Connects to the channel.
     */
    join(): void;
    /**
     * @desc Disconnects from the channel.
     */
    leave(): void;
    /**
     * @desc Monitors the presence state of the channel.
     * @param callback - The callback to call when the presence state changes.
     */
    onPresenceUpdate(callback: (presence: PondPresence[]) => void): void;
    /**
     * @desc Monitors the channel for messages.
     * @param callback - The callback to call when a message is received.
     */
    onMessage(callback: (event: string, message: any) => void): void;
    /**
     * @desc Broadcasts a message to the channel, including yourself.
     * @param event - The event to send.
     * @param message - The message to send.
     */
    broadcast(event: string, message: any): void;
    /**
     * @desc Broadcasts a message to every other client in the channel except yourself.
     * @param event - The event to send.
     * @param message - The message to send.
     */
    broadcastFrom(event: string, message: any): void;
    /**
     * @desc Updates the presence state of the current client in the channel.
     * @param presence - The presence state to update.
     */
    updatePresence(presence: PondPresence): void;
    /**
     * @desc Sends a message to specific clients in the channel.
     * @param event - The event to send.
     * @param message - The message to send.
     * @param to - The clients to send the message to.
     */
    sendMessage(event: string, message: any, to: string[]): void;
    /**
     * @desc Listens for the connections state of the channel.
     * @param callback - The callback to call when the connection state changes.
     */
    onConnectionChange(callback: (connected: boolean) => void): void;
}

export {};
