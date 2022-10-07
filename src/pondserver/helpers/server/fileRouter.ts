import {IncomingMessage, ServerResponse} from "http";
import path from "path";
import * as fs from "fs";
import {NextFunction} from "../middleWare";

type IFileRouter = (absolutePath: string) => (request: IncomingMessage, response: ServerResponse, next: NextFunction) => void;

const getContentType = (extension: string) => {
    switch (extension) {
        case '.html':
            return 'text/html';
        case '.js':
            return 'text/javascript';
        case '.css':
            return 'text/css';
        case '.json':
            return 'application/json';
        case '.png':
            return 'image/png';
        case '.jpg':
            return 'image/jpg';
        case '.wav':
            return 'audio/wav';
        default:
            return 'text/plain';
    }
}

const modifyUrl = (url: string | undefined) => {
    if (url === '/') {
        return '/index.html';
    }

    return url || '';
}

export const FileRouter: IFileRouter = (absolutePath) => (request, response, next) => {
    if (request.method !== "GET")
        return next();

    const modifiedUrl = modifyUrl(request.url);
    const filePath = path.join(absolutePath, modifiedUrl);

    if (!fs.existsSync(filePath))
        return next();

    const extension = path.extname(modifiedUrl);
    const contentType = getContentType(extension);

    fs.readFile(filePath, (error, content) => {
        if (error) {
            response.writeHead(500);
            response.end();
        } else {
            if (contentType.startsWith('image')) {
                response.writeHead(200, {'Content-Type': contentType});
                response.end(content, 'binary');
            } else {
                response.writeHead(200, {'Content-Type': contentType});
                response.end(content, 'utf-8');
            }
        }
    })
}
