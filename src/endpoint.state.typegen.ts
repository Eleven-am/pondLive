// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.(machine).authoriseSocket:invocation[0]": {
      type: "done.invoke.(machine).authoriseSocket:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.(machine).performAuth:invocation[0]": {
      type: "done.invoke.(machine).performAuth:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.(machine).authoriseSocket:invocation[0]": {
      type: "error.platform.(machine).authoriseSocket:invocation[0]";
      data: unknown;
    };
    "error.platform.(machine).performAuth:invocation[0]": {
      type: "error.platform.(machine).performAuth:invocation[0]";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    authoriseSocketToJoinChannel: "done.invoke.(machine).authoriseSocket:invocation[0]";
    performAuthentication: "done.invoke.(machine).performAuth:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {
    addSocketToChannel: "done.invoke.(machine).authoriseSocket:invocation[0]";
    addSocketToDB: "done.invoke.(machine).performAuth:invocation[0]";
    rejectChannelRequest: "error.platform.(machine).authoriseSocket:invocation[0]";
    rejectSocketConnection: "error.platform.(machine).performAuth:invocation[0]";
  };
  eventsCausingServices: {
    authoriseSocketToJoinChannel: "joinChannelRequest";
    performAuthentication: "authenticateSocket";
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates: "authoriseSocket" | "performAuth" | "ready";
  tags: never;
}
