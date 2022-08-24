import {assign, createMachine, interpret, Interpreter} from "xstate";
import {default_t, IncomingChannelMessage, InternalAssigns, PondAssigns, PondPresence, PondResponse} from "../index";
import {BaseClass, BaseMap, BasePromise, RejectPromise} from "./utils";
import {
    EndpointInternalClientDisconnectedEvent,
    EndpointInternalEvents,
    EndpointInterpreter,
    JoinChannelRequestSubSuccessEvent
} from "./endpoint.state";
import {Subject} from "rxjs";
import {InternalPondChannel} from "./channel";
import {filter} from "rxjs/operators";

type ChannelJoinRoomEvent = {
    type: 'joinRoom';
    clientId: string;
    data: JoinChannelRequestSubSuccessEvent;
}

type ChannelUpdatePresenceEvent = {
    type: 'updatePresence';
    clientId: string;
    assigns: PondAssigns;
    presence: PondPresence;
}

type ChannelLeaveRoomEvent = {
    type: 'leaveRoom';
    clientId: string;
}

type SendMessageErrorEvent = {
    type: 'error.platform.(machine).authoriseMessage:invocation[0]' | 'errorMessage';
    data: RejectPromise<{
        addresses: string[];
        clientId: string;
    }>;
}

type SendMessageEvent = {
    type: 'done.invoke.(machine).authoriseMessage:invocation[0]';
    data: ChannelMessageBody;
}

type ChannelMessageBody = {
    message: default_t & { event: string };
    clientId: string;
    assigns: PondAssigns;
    presence: PondPresence;
    targets: string[] | 'all' | 'allExcept';
}

type ChannelSendMessageEvent = {
    type: 'sendMessage';
} & ChannelMessageBody;

type ChannelEvents =
    ChannelJoinRoomEvent
    | ChannelUpdatePresenceEvent
    | ChannelLeaveRoomEvent
    | ChannelSendMessageEvent
    | SendMessageErrorEvent
    | SendMessageEvent;

type ChannelContext = {
    channelId: string;
    channelName: string;
    channelData: default_t;
    verifiers: BaseMap<string | RegExp, (req: IncomingChannelMessage, res: PondResponse, room: InternalPondChannel) => void>;
    observable: Subject<EndpointInternalEvents>;
    presences: BaseMap<string, PondPresence>;
    assigns: BaseMap<string, PondAssigns>;
}

export type ChannelInterpreter = Interpreter<ChannelContext, any, ChannelEvents, { value: any; context: ChannelContext; }, any>

export class ChannelMachine {
    public readonly interpreter: ChannelInterpreter;
    private readonly parent: EndpointInterpreter;
    private readonly base: BaseClass;

    constructor(context: ChannelContext, parent: EndpointInterpreter) {
        this.interpreter = this.start(context);
        this.base = new BaseClass();
        this.parent = parent;

        this.listenForDisconnectedClients(parent.state.context.observable);
    }

    /**
     * @desc Checks if there is at least one user in the channel
     * @param ctx - The current context
     * @param evt - The event that triggered the transition
     * @private
     */
    private static atLeastOneUser(ctx: ChannelContext, evt: ChannelLeaveRoomEvent): boolean {
        return ctx.presences.allExcept(evt.clientId).length > 0;
    }

    /**
     * @desc Listens for disconnected clients
     * @param subject - The subject of the parent machine to listen to
     */
    private listenForDisconnectedClients(subject: Subject<EndpointInternalEvents>) {
        const subscription = subject
            .pipe(
                filter((x: any) => x.event === 'CLIENT_DISCONNECTED'),
                filter((x: EndpointInternalClientDisconnectedEvent) => this.interpreter.state.context.presences.has(x.clientId)),
            )
            .subscribe(x => {
                this.interpreter.send({
                    type: 'leaveRoom',
                    clientId: x.clientId,
                });
            })

        this.interpreter.onStop(() => subscription.unsubscribe());
    }

    /**
     * @desc Starts the channel machine
     * @param context - The initial context of the channel
     * @private
     */
    private start(context: ChannelContext) {
        const machine =
            /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlwgBswBiAVwAcJ0AXMABQCc4x9MxFQ9APaxczXEPwCQAD0QBGAKwB2EgDZFAJkXyAHAAZNegMz7lAGhABPRAFpjAFlUP5ATkdr97ta4euAvv6WaFh4hKTkVNRU6ABuYABKQkKo0sKi4pLScgi2urok8trGrq7yTmXGRpY2uYpqJEaammrKjmYOag4OgcEYOATEZJQ0AFZCBEkpaSJiElJIsnby6vLKutr6+m7Ku-qtNXYO+gXbrmq6xsaXFT1BICED4cNRsDwQALJwsOgwMxnzbIKeqFLrbFrKHS6NQXQ4IFQkZTaZTnUraGHyYy9B79MJDSI0MAcDhCDhfWA-P6LdJzLKLHK2NbGEidTTKfQqUxszFw2yaAyIxTGTEXfJuHxY+6PPGkdC0ZjYUm4N7kyk0CCSMBkfCxIQAay10sGsvlio4yrAqt+YAQBF1mBY8wA2voALr-WkLUA5IwORotUzCraKXSKXxwlp+hwhrYtfJI7rYo3POUKpUq77W6hEkkcEj0CgsABmpNQJGTQ1TZotVpgtp1QgdmXwLvd1NmzaBdTUmhZ+j8XTKugcl10vPk8ganhHVX7OjWakC93wQggcGkFYiIw9nfpdk0VUFMI0piULRO498jWMyjWE7Kyh8umUSdxxpIsGw8oAIkIAO74FMqTtgCdLekc2gkCouiYvykIXGYcJFKoQpdKYrj5D21yvqE75VumlqZlSggdoCe65CUfr8tsmLHJ4Xj9hGw6IpCWglO4DiOEoOFPMQO5keBdTQn2A5+HoM5jtYRwClsFwYX4jhIuUS7+EAA */
            createMachine({
                context: context,
                tsTypes: {} as import("./channel.state.typegen").Typegen0,
                schema: {context: {} as ChannelContext, events: {} as ChannelEvents},
                predictableActionArguments: true,
                id: "(machine)",
                states: {
                    idle: {
                        on: {
                            updatePresence: {
                                actions: "modifyPresence",
                                target: "idle",
                                internal: false,
                            },
                            leaveRoom: [
                                {
                                    actions: "modifyPresence",
                                    cond: "atLeastOneUser",
                                    target: "idle",
                                    internal: false,
                                },
                                {
                                    actions: "shutDownChannel",
                                    target: "shutDownRoom",
                                },
                            ],
                            joinRoom: {
                                actions: "modifyPresence",
                                target: "idle",
                                internal: false,
                            },
                            sendMessage: {
                                target: "authoriseMessage",
                            },
                            errorMessage: {
                                actions: "sendErrorMessage",
                                target: "idle",
                                internal: false,
                            },
                        },
                    },
                    shutDownRoom: {
                        type: "final",
                    },
                    authoriseMessage: {
                        invoke: {
                            src: "canPerformAction",
                            onDone: [
                                {
                                    actions: "sendTheMessages",
                                    target: "idle",
                                },
                            ],
                            onError: [
                                {
                                    actions: "sendErrorMessage",
                                    target: "idle",
                                },
                            ],
                        },
                    },
                },
                initial: "idle",
            }, {
                actions: {
                    modifyPresence: (ctx, evt) => this.modifyPresence(ctx, evt),
                    sendTheMessages: (ctx, evt) => this.sendTheMessages(ctx, evt.data),
                    sendErrorMessage: (ctx, evt) => this.sendErrorMessage(ctx, evt),
                    shutDownChannel: (ctx, evt) => this.shutDownChannel(ctx, evt),
                },
                guards: {
                    atLeastOneUser: (ctx, evt) => ChannelMachine.atLeastOneUser(ctx, evt),
                },
                services: {
                    canPerformAction: (ctx, evt) => this.canPerformAction(ctx, evt),
                }
            });

        return interpret(machine).start();
    }

    /**
     * @desc Modifies the presence of the channel
     * @param ctx - The current context
     * @param evt - The event that triggered the transition
     * @private
     */
    private modifyPresence(ctx: ChannelContext, evt: ChannelUpdatePresenceEvent | ChannelJoinRoomEvent | ChannelLeaveRoomEvent) {
        const currentPresence: InternalAssigns[] = ctx.presences.toArrayMap(([clientId, presence]) => ({
            ...presence,
            clientId
        }));
        let updatedPresence: InternalAssigns[] = [];

        if (evt.type === "updatePresence") {
            updatedPresence = this.base.replaceObjectInArray(currentPresence, 'clientId', {
                clientId: evt.clientId,
                presence: evt.presence
            });
            assign({
                presences: new BaseMap(ctx.presences.set(evt.clientId, evt.presence)),
                assigns: new BaseMap(ctx.assigns.set(evt.clientId, evt.assigns))
            })
        } else if (evt.type === "joinRoom") {
            updatedPresence = currentPresence.concat([{clientId: evt.clientId, presence: evt.data.presence}]);
            assign({
                presences: new BaseMap(ctx.presences.set(evt.clientId, evt.data.presence)),
                assigns: new BaseMap(ctx.assigns.set(evt.clientId, evt.data.assigns))
            })
        } else if (evt.type === "leaveRoom") {
            updatedPresence = currentPresence.filter(({clientId}) => clientId !== evt.clientId);
            assign({
                presences: new BaseMap(ctx.presences.deleteKey(evt.clientId)),
                assigns: new BaseMap(ctx.assigns.deleteKey(evt.clientId))
            });
        }

        this.parent.state.context.observable.next({
            type: 'SERVER',
            event: 'PRESENCE_UPDATE',
            channelName: ctx.channelName,
            channelId: ctx.channelId,
            addresses: updatedPresence.map(({clientId}) => clientId),
            payload: {
                updatedPresence,
            }
        })
    }

    /**
     * @desc Sends the messages to the channel's clients
     * @param ctx - The current context
     * @param evt - The event that triggered the transition
     * @private
     */
    private sendTheMessages(ctx: ChannelContext, evt: ChannelMessageBody) {
        const {clientId, targets} = evt;
        const {event, ...message} = evt.message;
        const addresses = targets === 'all' ? Array.from(ctx.presences.keys()) : targets === 'allExcept' ? ctx.presences.allExcept(clientId).map(c => c.id) : targets;
        this.parent.state.context.observable.next({
            type: 'SERVER',
            event: 'BROADCAST_MESSAGE_TO_CHANNEL',
            subEvent: event,
            channelName: ctx.channelName,
            channelId: ctx.channelId,
            addresses: addresses,
            payload: message,
        });
    }

    /**
     * @desc Sends an error message to the channel's clients
     * @param ctx - The current context
     * @param evt - The event that triggered the transition
     * @private
     */
    private sendErrorMessage(ctx: ChannelContext, evt: SendMessageErrorEvent) {
        this.parent.state.context.observable.next({
            type: 'SERVER',
            event: 'CHANNEL_ERROR',
            channelName: ctx.channelName,
            channelId: ctx.channelId,
            addresses: evt.data.data.addresses || Array.from(ctx.presences.keys()),
            reason: evt.data.errorMessage,
        });
    }

    /**
     * @desc Shuts down the channel
     * @param ctx - The current context
     * @param _evt - The event that triggered the transition
     * @private
     */
    private shutDownChannel(ctx: ChannelContext, _evt: ChannelLeaveRoomEvent) {
        this.parent.state.context.observable.next({
            type: 'SERVER',
            event: 'CHANNEL_SHUTDOWN',
            channelName: ctx.channelName,
            channelId: ctx.channelId,
            addresses: ctx.presences.toArrayMap(([clientId]) => clientId),
            reason: 'NO_USERS',
        });
    }

    /**
     * @desc Checks if the action can be performed by the client
     * @param ctx - The current context
     * @param evt - The event that triggered the transition
     * @private
     */
    private canPerformAction(ctx: ChannelContext, evt: ChannelSendMessageEvent) {
        const {clientId} = evt;
        const {event, ...message} = evt.message;
        return BasePromise<ChannelMessageBody, { addresses: string[], clientId: string }>((resolve, reject) => {
            const client = ctx.presences.get(clientId);
            if (!client)
                return reject('CLIENT_NOT_FOUND', 400, {
                    addresses: [clientId],
                    clientId: clientId,
                });

            const response = this.base.generatePondResponse((assigns) => {
                resolve(evt);

                if (assigns) {
                    const internalAssigns: PondAssigns = {...evt.assigns, ...assigns.assign};
                    const internalPresence: PondPresence = {...evt.presence, ...assigns.presence};

                    this.interpreter.send({
                        type: 'updatePresence',
                        clientId: clientId,
                        presence: internalPresence,
                        assigns: internalAssigns,
                    })
                }
            }, reject, {
                clientId: evt.clientId,
                addresses: [evt.clientId],
            });

            const request: IncomingChannelMessage = {
                event: event,
                channelId: ctx.channelId,
                channelName: ctx.channelName,
                message: message,
                client: {
                    clientId: clientId,
                    clientAssigns: evt.assigns,
                    clientPresence: evt.presence,
                }
            };

            const verifier = ctx.verifiers.findByKey(path => this.base.compareStringToPattern(event, path));

            const room = new InternalPondChannel(ctx.channelName, ctx.channelId, this.interpreter);

            if (verifier)
                verifier.value(request, response, room);

            else resolve(evt);
        }, {
            clientId: evt.clientId,
            addresses: [evt.clientId],
        })
    }
}
