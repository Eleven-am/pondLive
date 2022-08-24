/// <reference types="node" />
import { IncomingMessage } from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import internal from "stream";
import { Interpreter } from "xstate";
import { BaseMap, RejectPromise } from "./utils";
import { Server } from "http";
import { EndpointInterpreter } from "./endpoint.state";
declare type MachineContext = {
    server: Server;
    socketServer: WebSocketServer;
    paths: BaseMap<string, string | RegExp>;
    connections: BaseMap<string, WebSocket>;
    endpoints: BaseMap<string, EndpointInterpreter>;
};
export declare type ServerInterpreter = Interpreter<MachineContext, any, ServerMachineEvent, {
    value: any;
    context: MachineContext;
}, any>;
declare type SpawnEndpointEvent = {
    type: 'spawnEndpoint';
    data: {
        endpoint: EndpointInterpreter;
        path: string | RegExp;
        endpointId: string;
    };
};
declare type PassSocketToEndPointEvent = {
    type: 'done.invoke.(machine).authenticate:invocation[0]';
    data: InternalPassSocketToEndPointEvent;
};
export declare type InternalPassSocketToEndPointEvent = {
    endpointId: string;
    endpoint: string;
    socket: internal.Duplex;
    request: IncomingMessage;
    head: Buffer;
};
declare type RejectRequestEvent = {
    type: 'error.platform.(machine).authenticate:invocation[0]';
    data: RejectPromise<internal.Duplex>;
};
declare type ShutDownServerEvent = {
    type: 'error.platform.(machine).idle:invocation[0]' | 'shutdown' | 'error';
    data: RejectPromise<string>;
};
declare type SetUpServerEvent = {
    type: 'done.invoke.(machine).idle:invocation[0]';
    data: void;
};
declare type AuthenticateSocketEvent = {
    type: 'authenticateSocket';
    data: {
        socket: internal.Duplex;
        request: IncomingMessage;
        head: Buffer;
    };
};
declare type ServerMachineEvent = PassSocketToEndPointEvent | RejectRequestEvent | ShutDownServerEvent | AuthenticateSocketEvent | SpawnEndpointEvent | SetUpServerEvent;
export declare class ServerMachine {
    private readonly base;
    interpreter: ServerInterpreter;
    constructor(context: MachineContext);
    /**
     * @desc Starts the server machine
     * @param context - The machine context
     * @private
     */
    private start;
    /**
     * @desc Passes a socket to the endpoint
     * @param ctx - The machine context
     * @param event - The event triggering the action
     */
    private static passSocketToEndpoint;
    /**
     * @desc Rejects a socket request
     * @param _ctx - The machine context
     * @param event - The event triggering the action
     */
    private static rejectRequest;
    /**
     * @desc Shuts down the server
     * @param ctx - The machine context
     * @param event - The event triggering the action
     */
    private shutDownServer;
    /**
     * @desc Spawns a new endpoint
     * @param ctx - The machine context
     * @param event - The event triggering the action
     */
    private static spawnEndpoint;
    /**
     * @desc sets up the server
     * @param ctx - The machine context
     * @param _event - The event triggering the action
     */
    private setupServer;
    /**
     * @desc finds the endpoint for the socket
     * @param ctx - The machine context
     * @param event - The event triggering the action
     */
    private findEndpoint;
    /**
     * @desc Makes sure that every client is still connected to the pond
     * @param server - WebSocket server
     */
    private pingClients;
}
export {};
