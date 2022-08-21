import { Subject } from "rxjs";
import { default_t, JoinRoomPromise, NewIncomingRequest } from "./sockets";
import { BaseMap } from "./base";
declare type SocketJoinRoomRequest = {
    topic: "NEW_INCOMING_REQUEST";
    channel: string;
    payload: {
        roomData: default_t;
    };
};
export declare type SocketJoinRoomResponse = {
    topic: "JOIN_ROOM_RESPONSE";
    channel: string;
    payload: {
        status: "success" | "failure";
        response: {
            error?: string;
        };
    };
};
export declare type DefaultServerErrorResponse = {
    topic: "ERROR_RESPONSE";
    channel: string;
    payload: {
        error: string;
        errorCode: number;
    };
};
declare type SocketLeaveRoomRequest = {
    topic: "LEAVE_ROOM_REQUEST";
    channel: string;
    payload: {};
};
declare type SocketClientMessage = {
    topic: "MESSAGE";
    channel: string;
    mode: 'BROADCAST' | 'BROADCAST_EXCEPT_SELF' | 'BROADCAST_TO_ASSIGNED';
    payload: {
        event: string;
        message: default_t;
        timestamp: string;
        assignedTo: string[] | null;
    };
};
export declare type SocketClientMessageType = SocketClientMessage | SocketJoinRoomRequest | SocketLeaveRoomRequest;
interface UserMessageEvent<T = any> {
    payload?: T;
    channel: string;
    event: 'joinRoom' | 'leaveRoom' | 'sendMessage' | 'updatePresence';
    addresses: string[] | 'all' | 'allExcept';
    emitter: 'userMessage';
    clientId: string;
}
interface ChannelMessageEvent<T = any> {
    payload?: T;
    timestamp: string;
    channel: string;
    event: 'presenceBrief' | 'presenceChange' | 'broadcastFrom' | 'broadcast' | 'privateMessage' | 'errorMessage';
    addresses: string[];
    emitter: 'channelMessage';
    senderId: string;
}
export declare type Presence<T> = default_t<T> & {
    id: string;
};
declare type Assign<T> = default_t<T> & {
    id: string;
};
interface ChannelsContext<T = any> {
    presences: BaseMap<string, Omit<Presence<T>, 'id'>>;
    assigns: BaseMap<string, Omit<Assign<T>, 'id'>>;
}
declare type InternalPondChannel = {
    getPresenceList: <T>() => Presence<T>[];
    getRoomData: () => default_t;
    disconnect: (clientId: string) => void;
    broadcast: (event: string, payload: default_t) => void;
    broadcastFrom: (clientId: string, event: string, payload: default_t) => void;
    send: (clientId: string, event: string, payload: default_t) => void;
};
declare type ChannelMessageBody = {
    message: default_t & {
        event: string;
    };
    clientId: string;
    assigns: default_t;
    targets: string[] | 'all' | 'allExcept';
    severSent: boolean;
};
export declare type OutBoundChannelEvent = NewIncomingRequest<Omit<ChannelMessageBody, 'targets' | 'severSent'>, {
    assigns?: default_t;
    presence?: default_t;
}> & {
    room: InternalPondChannel;
};
export declare type ChannelMessageEventVerifiers = Map<string, ((outBound: OutBoundChannelEvent) => void)>;
export declare class Channel {
    readonly channel: string;
    readonly _state$: Subject<ChannelMessageEvent | UserMessageEvent>;
    private _isActive;
    private readonly _messageEventVerifiers;
    private _interpreter;
    constructor(channel: string, roomData: default_t, verifiers: ChannelMessageEventVerifiers);
    private _roomData;
    /**
     * @desc Getter for the room data of the channel
     */
    get roomData(): default_t;
    /**
     * @desc checks if the channel is active
     */
    get state(): 'active' | 'inactive';
    /**
     * @desc Getter for the context of the state machine
     */
    get context(): ChannelsContext | undefined;
    /**
     * @desc Gets the presence list of the channel
     */
    get presenceList(): Presence<any>[];
    /**
     * @desc Getter for the internal channel
     * @private
     */
    get room(): InternalPondChannel;
    /**
     * @desc Checks if the channel has at least one user
     */
    private static atLeastOneUser;
    /**
     * @desc adds the user to the channel
     * @param event - The event that triggered the transition
     */
    addSocket(event: JoinRoomPromise): void;
    /**
     * @desc removes the user from the channel
     * @param clientId - The client id of the user
     */
    removeSocket(clientId: string): void;
    /**
     * @desc broadcasts a message to the channel
     * @param event - The event that triggered the message
     * @param message - The message to broadcast
     */
    broadcast(event: string, message: default_t): void;
    /**
     * @desc broadcasts from a user to a message to the channel
     * @param clientId - The client id of the user
     * @param event - The event that triggered the message
     * @param message - The message to broadcast
     */
    broadcastFrom(clientId: string, event: string, message: default_t): void;
    /**
     * @desc sends a message to a user
     * @param clientId - The client id of the user
     * @param event - The event that triggered the message
     * @param message - The message to send
     */
    privateMessage(clientId: string, event: string, message: default_t): void;
    /**
     * @desc initialises the channel
     * @private
     */
    private init;
    /**
     * @desc Modifies the of the users in the channel
     * @param context - The current context of the state machine
     * @param event - The event that triggered the transition
     * @private
     */
    private modifyPresence;
    /**
     * @desc sends an error message to the user in the channel
     * @param _context - The current context of the state machine
     * @param event - The event that triggered the transition
     */
    private sendErrorMessage;
    /**
     * @desc sends the message to the users in the channel
     * @param context - The current context of the state machine
     * @param event - The event that triggered the transition
     */
    private sendTheMessages;
    /**
     * @desc shuts down the channel
     * @param _context - The current context of the state machine
     * @param _event - The event that triggered the transition
     */
    private shutDownChannel;
    /**
     * @desc subscribes to the state of the channel
     */
    private subscribeToState;
    /**
     * @desc subscribes to the state of the socket
     * @param event - The event that triggered the transition
     * @param subscription - The subscription to the socket state
     */
    private subscribeToSocket;
    /**
     * @desc checks if the user can perform the action
     * @param context - The current context of the state machine
     * @param event - The event that triggered the transition
     */
    private canPerformAction;
    /**
     * @desc Reads socket message from the client
     * @param message - The message from the client
     * @param clientId - The client id of the client
     */
    private readMessage;
}
export {};
