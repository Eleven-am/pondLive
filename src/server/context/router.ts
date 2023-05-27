import fs from 'fs';
import { ServerResponse, IncomingMessage } from 'http';
import path from 'path';

import type { Client } from '@eleven-am/pondsocket/types';


import { Context } from './context';
import { Component } from './liveContext';
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

    async upgradeUser (userId: string, channel: Client, address: string) {
        await this.#context.upgradeUser(userId, channel, address);
    }

    performAction (event: ServerEvent) {
        return this.#context.performAction(event);
    }

    addStaticRoute (dir: string) {
        this.#middleware.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
            const filePath = path.join(dir, req.url!);

            if (!path.extname(filePath)) {
                return next();
            }

            if (!await fileExists(filePath)) {
                // TODO: 404 page handle this more gracefully
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
}
