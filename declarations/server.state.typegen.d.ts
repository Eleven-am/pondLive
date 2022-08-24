export interface Typegen0 {
    "@@xstate/typegen": true;
    internalEvents: {
        "done.invoke.(machine).authenticate:invocation[0]": {
            type: "done.invoke.(machine).authenticate:invocation[0]";
            data: unknown;
            __tip: "See the XState TS docs to learn how to strongly type this.";
        };
        "error.platform.(machine).authenticate:invocation[0]": {
            type: "error.platform.(machine).authenticate:invocation[0]";
            data: unknown;
        };
        "error.platform.(machine).idle:invocation[0]": {
            type: "error.platform.(machine).idle:invocation[0]";
            data: unknown;
        };
        "xstate.init": {
            type: "xstate.init";
        };
    };
    invokeSrcNameMap: {
        findEndpoint: "done.invoke.(machine).authenticate:invocation[0]";
        setupServer: "done.invoke.(machine).idle:invocation[0]";
    };
    missingImplementations: {
        actions: never;
        services: never;
        guards: never;
        delays: never;
    };
    eventsCausingActions: {
        passSocketToEndpoint: "done.invoke.(machine).authenticate:invocation[0]";
        rejectRequest: "error.platform.(machine).authenticate:invocation[0]";
        shutDownServer: "error" | "error.platform.(machine).idle:invocation[0]" | "shutdown";
        spawnEndpoint: "spawnEndpoint";
    };
    eventsCausingServices: {
        findEndpoint: "authenticateSocket";
        setupServer: "xstate.init";
    };
    eventsCausingGuards: {};
    eventsCausingDelays: {};
    matchesStates: "authenticate" | "idle" | "ready" | "terminateServer";
    tags: never;
}
