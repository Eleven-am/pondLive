"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadAuthoriseMessage = void 0;
const baseClass_1 = require("../../utils/baseClass");
const pondResponse_1 = require("../../utils/pondResponse");
class UploadAuthoriseMessage extends baseClass_1.BaseClass {
    constructor(files, identifier, clientId, uploadPath, channel) {
        super();
        this._files = files;
        this._identifier = identifier;
        this.clientId = clientId;
        this._channel = channel;
        this._uploadPath = uploadPath;
    }
    get files() {
        return this._files.map((file) => {
            const acceptUpload = this._authorizeDownload.bind(this, file.identifier);
            const declineUpload = this._declineDownload.bind(this, file.identifier);
            return {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                acceptUpload: acceptUpload,
                declineUpload: declineUpload
            };
        });
    }
    /**
     * @desc Creates a socket response object.
     */
    _createPondResponse() {
        return new pondResponse_1.PondResponse(this._channel);
    }
    authoriseAll() {
        this._authorizeDownload(this._identifier);
    }
    sendError(message) {
        this._declineDownload(this._identifier, message);
    }
    _authorizeDownload(identifier) {
        const csrfObject = {
            token: identifier, clientId: this.clientId, timestamp: Date.now()
        };
        const response = this._createPondResponse();
        const csrfToken = this.encrypt(this.clientId, csrfObject);
        response.send(`uploadToken/${identifier}`, {
            identifier: identifier, token: csrfToken,
            uploadPath: this._uploadPath
        });
    }
    _declineDownload(identifier, message) {
        const response = this._createPondResponse();
        response.send(`uploadError/${identifier}`, {
            identifier: identifier, error: message || 'Unauthorized'
        });
    }
}
exports.UploadAuthoriseMessage = UploadAuthoriseMessage;
