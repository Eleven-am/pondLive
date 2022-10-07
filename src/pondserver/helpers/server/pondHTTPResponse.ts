import {ServerResponse} from "http";
import {PondError} from "../../../pondbase";

export class PondHTTPResponse {
    private _responseSent = false;
    private statusCode: number = 200;
    private readonly _response: ServerResponse;

    constructor(response: ServerResponse) {
        this._response = response;
    }

    public json(data: any): void {
        if (this._responseSent)
            throw new PondError('Response already sent', 500, 'PondHTTPResponse');
        this._responseSent = true;
        this._response.writeHead(this.statusCode, {
            'Content-Type': 'application/json'
        });
        this._response.end(JSON.stringify(data));
    }

    public html(data: string): void {
        if (this._responseSent)
            throw new PondError('Response already sent', 500, 'PondHTTPResponse');
        this._responseSent = true;
        this._response.writeHead(this.statusCode, {
            'Content-Type': 'text/html'
        });
        this._response.end(data);
    }

    public send(data: any): void {
        if (this._responseSent)
            throw new PondError('Response already sent', 500, 'PondHTTPResponse');
        this._responseSent = true;
        this._response.writeHead(this.statusCode);
        this._response.end(data);
    }

    public redirect(url: string): void {
        if (this._responseSent)
            throw new PondError('Response already sent', 500, 'PondHTTPResponse');
        this._responseSent = true;
        this._response.writeHead(302, {
            Location: url
        });
        this._response.end();
    }

    public setHeader(key: string, value: string): PondHTTPResponse {
        this._response.setHeader(key, value);
        return this;
    }

    public getHttpServerResponse(): ServerResponse {
        return this._response;
    }

    public end(): void {
        this._response.end();
    }

    public pipe(stream: any): void {
        stream.pipe(this._response);
    }

    public status(code: number, message?: string): PondHTTPResponse  {
        this._response.writeHead(code, message);
        return this;
    }
}
