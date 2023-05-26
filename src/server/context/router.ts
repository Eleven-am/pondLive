import fs from 'fs';
import { ServerResponse, IncomingMessage } from 'http';
import path from 'path';

import type { Client } from '@eleven-am/pondsocket/types';

import { Component, Context } from './context';
import { uuidV4, fileExists } from '../helpers/helpers';
import { ServerEvent } from '../hooks/useState';
import { Middleware } from '../middleware/middleware';
import { Request } from '../wrappers/request';
import { Response } from '../wrappers/response';


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

        const data = this.#context.initRoute(route, true);

        this.#middleware.use(async (req, res, next) => {
            const request = Request.fromRequest(req);
            const response = new Response(res);
            const match = [data.path, ...data.routes].find((route) => route.match(request.url.pathname));

            if (!match) {
                return next();
            }

            const userId = request.headers['x-user-id'] as string || uuidV4();

            await this.#context.renderToString(request, response, route, userId, serverDir);
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

    upgradeUser (userId: string, channel: Client, address: string) {
        this.#context.upgradeUser(userId, channel, address);
    }

    performAction (userId: string, action: string, event: ServerEvent) {
        return this.#context.performAction(userId, action, event);
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
