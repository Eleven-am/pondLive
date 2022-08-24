import { Interpreter } from "xstate";
import { default_t, IncomingChannelMessage, PondAssigns, PondPresence, PondResponse } from "../index";
import { BaseMap, RejectPromise } from "./utils";
import { EndpointInternalEvents, EndpointInterpreter, JoinChannelRequestSubSuccessEvent } from "./endpoint.state";
import { Subject } from "rxjs";
import { InternalPondChannel } from "./channel";
declare type ChannelJoinRoomEvent = {
    type: 'joinRoom';
    clientId: string;
    data: JoinChannelRequestSubSuccessEvent;
};
declare type ChannelUpdatePresenceEvent = {
    type: 'updatePresence';
    clientId: string;
    assigns: PondAssigns;
    presence: PondPresence;
};
declare type ChannelLeaveRoomEvent = {
    type: 'leaveRoom';
    clientId: string;
};
declare type SendMessageErrorEvent = {
    type: 'error.platform.(machine).authoriseMessage:invocation[0]' | 'errorMessage';
    data: RejectPromise<{
        addresses: string[];
        clientId: string;
    }>;
};
declare type SendMessageEvent = {
    type: 'done.invoke.(machine).authoriseMessage:invocation[0]';
    data: ChannelMessageBody;
};
declare type ChannelMessageBody = {
    message: default_t & {
        event: string;
    };
    clientId: string;
    assigns: PondAssigns;
    presence: PondPresence;
    targets: string[] | 'all' | 'allExcept';
};
declare type ChannelSendMessageEvent = {
    type: 'sendMessage';
} & ChannelMessageBody;
declare type ChannelEvents = ChannelJoinRoomEvent | ChannelUpdatePresenceEvent | ChannelLeaveRoomEvent | ChannelSendMessageEvent | SendMessageErrorEvent | SendMessageEvent;
declare type ChannelContext = {
    channelId: string;
    channelName: string;
    channelData: default_t;
    verifiers: BaseMap<string | RegExp, (req: IncomingChannelMessage, res: PondResponse, room: InternalPondChannel) => void>;
    observable: Subject<EndpointInternalEvents>;
    presences: BaseMap<string, PondPresence>;
    assigns: BaseMap<string, PondAssigns>;
};
export declare type ChannelInterpreter = Interpreter<ChannelContext, any, ChannelEvents, {
    value: any;
    context: ChannelContext;
}, any>;
export declare class ChannelMachine {
    readonly interpreter: ChannelInterpreter;
    private readonly parent;
    private readonly base;
    constructor(context: ChannelContext, parent: EndpointInterpreter);
    /**
     * @desc Checks if there is at least one user in the channel
     * @param ctx - The current context
     * @param evt - The event that triggered the transition
     * @private
     */
    private static atLeastOneUser;
    /**
     * @desc Listens for disconnected clients
     * @param subject - The subject of the parent machine to listen to
     */
    private listenForDisconnectedClients;
    /**
     * @desc Starts the channel machine
     * @param context - The initial context of the channel
     * @private
     */
    private start;
    /**
     * @desc Modifies the presence of the channel
     * @param ctx - The current context
     * @param evt - The event that triggered the transition
     * @private
     */
    private modifyPresence;
    /**
     * @desc Sends the messages to the channel's clients
     * @param ctx - The current context
     * @param evt - The event that triggered the transition
     * @private
     */
    private sendTheMessages;
    /**
     * @desc Sends an error message to the channel's clients
     * @param ctx - The current context
     * @param evt - The event that triggered the transition
     * @private
     */
    private sendErrorMessage;
    /**
     * @desc Shuts down the channel
     * @param ctx - The current context
     * @param _evt - The event that triggered the transition
     * @private
     */
    private shutDownChannel;
    /**
     * @desc Checks if the action can be performed by the client
     * @param ctx - The current context
     * @param evt - The event that triggered the transition
     * @private
     */
    private canPerformAction;
}
export {};
