export interface Typegen0 {
    "@@xstate/typegen": true;
    internalEvents: {
        "done.invoke.globalSockets.authoriser:invocation[0]": {
            type: "done.invoke.globalSockets.authoriser:invocation[0]";
            data: unknown;
            __tip: "See the XState TS docs to learn how to strongly type this.";
        };
        "done.invoke.globalSockets.lobby:invocation[0]": {
            type: "done.invoke.globalSockets.lobby:invocation[0]";
            data: unknown;
            __tip: "See the XState TS docs to learn how to strongly type this.";
        };
        "error.platform.globalSockets.authoriser:invocation[0]": {
            type: "error.platform.globalSockets.authoriser:invocation[0]";
            data: unknown;
        };
        "error.platform.globalSockets.idle:invocation[0]": {
            type: "error.platform.globalSockets.idle:invocation[0]";
            data: unknown;
        };
        "error.platform.globalSockets.lobby:invocation[0]": {
            type: "error.platform.globalSockets.lobby:invocation[0]";
            data: unknown;
        };
        "xstate.init": {
            type: "xstate.init";
        };
    };
    invokeSrcNameMap: {
        authenticateRoom: "done.invoke.globalSockets.lobby:invocation[0]";
        authenticateSocket: "done.invoke.globalSockets.authoriser:invocation[0]";
        setupServer: "done.invoke.globalSockets.idle:invocation[0]";
    };
    missingImplementations: {
        actions: never;
        services: never;
        guards: never;
        delays: never;
    };
    eventsCausingActions: {
        addSocketToDB: "done.invoke.globalSockets.authoriser:invocation[0]";
        joinRoom: "done.invoke.globalSockets.lobby:invocation[0]";
        rejectSocketConnection: "error.platform.globalSockets.authoriser:invocation[0]";
        sendErrorMessage: "error.platform.globalSockets.lobby:invocation[0]";
        shutDownServer: "error" | "error.platform.globalSockets.idle:invocation[0]" | "shutdown";
    };
    eventsCausingServices: {
        authenticateRoom: "requestToJoinRoom";
        authenticateSocket: "newUpgradeRequest";
        setupServer: "xstate.init";
    };
    eventsCausingGuards: {};
    eventsCausingDelays: {};
    matchesStates: "authoriser" | "idle" | "lobby" | "ready" | "terminateServer";
    tags: never;
}
