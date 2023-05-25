import type { Client } from '@eleven-am/pondsocket/types';
import type { CookieOptions } from 'express';

import { Request } from '../wrappers/request';
import { Response } from '../wrappers/response';

export declare class LiveSocket extends Client {
    readonly clientId: string;

    /**
     * @desc The type of the live socket.
     */
    get isWebsocket(): boolean;

    /**
     * @desc Emits an event on the browser window.
     * @param event - The event name.
     * @param data - The data to emit.
     */
    emit<EmitData>(event: string, data: EmitData): void;
}

export interface LiveBuilder {

    /**
     * @desc Called when the component is mounted.
     * @param handler - The handler to call.
     */
    onMount: (handler: (req: Request, res: Response) => void | Promise<void>) => void;

    /**
     * @desc Called when the component is connected to the server over websockets.
     * @param handler - The handler to call.
     */
    onUpgrade: (handler: (socket: LiveSocket, res: Response) => void | Promise<void>) => void;

    /**
     * @desc Called when the component is unmounted.
     * @param handler - The handler to call.
     */
    onUnmount: (handler: (req: Request, res: Response) => void | Promise<void>) => void;
}

export declare class LiveRouter {
    /**
     * @desc Navigates the client to a new page
     * @param path - The path to navigate to
     */
    navigateTo(path: string): Promise<void> | void;

    /**
     * @desc Replaces the current page with a new page
     * @param path - The path to replace with
     */
    replace(path: string): Promise<void> | void;

    /**
     * @desc Reloads the current page, only works if the client is already rendered
     */
    reload(): void;

    /**
     * @desc Sets a cookie
     * @param name - The name of the cookie
     * @param value - The value of the cookie
     * @param options - The options for the cookie
     */
    setCookie(name: string, value: string, options?: CookieOptions): void
}


