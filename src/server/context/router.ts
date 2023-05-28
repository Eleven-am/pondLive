import fs from 'fs';
import http, { ServerResponse, IncomingMessage } from 'http';
import path from 'path';

import PondSocket from '@eleven-am/pondsocket';
import type { Client, JoinResponse } from '@eleven-am/pondsocket/types';

import { Context } from './context';
import { Component } from './liveContext';
import { LiveEvent } from '../../client/types';
import { fileExists } from '../helpers/helpers';
import { Middleware } from '../middleware/middleware';
import { ServerEvent } from '../wrappers/serverEvent';


const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
};

const serverDir = path.join(__dirname, '..', '..', '..', 'dist');

export function getMimeType (filePath: string) {
    const extname = path.extname(filePath);

    return mimeTypes[extname] || 'text/html';
}

export class Router {
    #context: Context;

    #middleware: Middleware<IncomingMessage, ServerResponse>;

    constructor () {
        this.#middleware = new Middleware();
        this.#context = new Context();
    }

    addRoute (path: string, component: Component) {
        const route = {
            path,
            component,
        };

        const manager = this.#context.initRoute(route);

        this.#context.addEntryManager(manager);

        this.#middleware.use(async (req, res, next) => {
            await manager.handleHttpRequest(req, res, next, serverDir);
        });
    }

    execute () {
        this.addStaticRoute(serverDir);

        return async (req: IncomingMessage, res: ServerResponse) => {
            await this.#middleware.run(req, res, () => {
                res.statusCode = 404;
                res.end('Not found');
            });
        };
    }

    addStaticRoute (dir: string) {
        this.#middleware.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
            const filePath = path.join(dir, req.url!);

            if (!path.extname(filePath)) {
                return next();
            }

            if (!await fileExists(filePath)) {
                res.statusCode = 404;
                res.end('Not found');

                return;
            }

            const fileStream = fs.createReadStream(filePath);

            const extension = path.extname(filePath);

            res.setHeader('Content-Type', mimeTypes[extension] ?? 'text/plain');

            fileStream.pipe(res);
        });
    }

    serve (...args: any[]) {
        const server = http.createServer(this.execute());
        const pondSocket = new PondSocket(server);

        const endpoint = pondSocket.createEndpoint('/live', (request, response) => {
            response.accept();
        });

        const channel = endpoint.createChannel('/:userId', async (request, response) => {
            const userId = request.event.params.userId;
            const channel = request.client;
            const address = request.joinParams.address as string;
            const pondSocketId = request.user.id;

            if (!userId) {
                response.reject('No user id provided');

                return;
            }

            await this.#upgradeUser(userId, channel, response, address || '/', pondSocketId);
        });

        channel.onEvent('event', async (request, response) => {
            const userId = request.user.assigns.userId as string;
            const liveEvent = request.event.payload as unknown as LiveEvent;
            const channel = request.client;

            response.accept();
            const event = new ServerEvent(userId, channel, liveEvent);

            await this.#performAction(event);
        });

        channel.onLeave((event) => {
            this.#context.unmountUser(event.assigns.userId as string);
        });

        return pondSocket.listen(...args);
    }

    async #upgradeUser (userId: string, channel: Client, response: JoinResponse, address: string, pondSocketId: string) {
        await this.#context.upgradeUserOnJoin(userId, channel, response, address, pondSocketId);
    }

    #performAction (event: ServerEvent) {
        return this.#context.performAction(event);
    }
}
