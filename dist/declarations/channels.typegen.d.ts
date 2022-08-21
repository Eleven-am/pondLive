export interface Typegen0 {
    "@@xstate/typegen": true;
    internalEvents: {
        "done.invoke.channels.authoriseMessage:invocation[0]": {
            type: "done.invoke.channels.authoriseMessage:invocation[0]";
            data: unknown;
            __tip: "See the XState TS docs to learn how to strongly type this.";
        };
        "error.platform.channels.authoriseMessage:invocation[0]": {
            type: "error.platform.channels.authoriseMessage:invocation[0]";
            data: unknown;
        };
        "xstate.init": {
            type: "xstate.init";
        };
    };
    invokeSrcNameMap: {
        canPerformAction: "done.invoke.channels.authoriseMessage:invocation[0]";
    };
    missingImplementations: {
        actions: never;
        services: never;
        guards: never;
        delays: never;
    };
    eventsCausingActions: {
        modifyPresence: "joinRoom" | "leaveRoom" | "updatePresence";
        sendErrorMessage: "error.platform.channels.authoriseMessage:invocation[0]" | "errorMessage";
        sendTheMessages: "done.invoke.channels.authoriseMessage:invocation[0]";
        shutDownChannel: "leaveRoom";
    };
    eventsCausingServices: {
        canPerformAction: "sendMessage";
    };
    eventsCausingGuards: {
        atLeastOneUser: "leaveRoom";
    };
    eventsCausingDelays: {};
    matchesStates: "authoriseMessage" | "idle" | "shutDownRoom";
    tags: never;
}
