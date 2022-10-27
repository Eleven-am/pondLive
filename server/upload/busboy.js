"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.busBoyManager = void 0;
const busboy_1 = __importDefault(require("busboy"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const index_1 = require("./index");
/**
 * @desc This function is used to handle the upload of files to the server.
 * @param req - The request object from the http server.
 * @param res - The response object from the http server.
 * @param props - The props for the busboy manager.
 */
const busBoyManager = (req, res, props) => {
    const busboyInstance = (0, busboy_1.default)({ headers: req.headers });
    const files = [];
    let fileCount = 0, finished = false;
    busboyInstance.on('file', function (filePath, file, upload) {
        const tmpFile = path_1.default.join(__dirname, path_1.default.basename(filePath));
        const writeStream = fs_1.default.createWriteStream(tmpFile);
        fileCount++;
        writeStream.on('finish', () => {
            files.push({
                name: upload.filename,
                tempPath: tmpFile,
                size: writeStream.bytesWritten,
                mimetype: upload.mimeType,
                filePath: filePath
            });
            fileCount--;
            if (finished && fileCount === 0) {
                res.status(200)
                    .json({
                    files: files.map(e => {
                        return {
                            name: e.name, size: e.size, mimetype: e.mimetype,
                        };
                    })
                });
                const message = new index_1.UploadMessage(files);
                const { broadcaster, event, componentId, clientId } = props;
                broadcaster.publish({ message, event, componentId, clientId });
            }
        });
        file.pipe(writeStream);
    });
    busboyInstance.on('finish', function () {
        finished = true;
    });
    req.pipe(busboyInstance);
};
exports.busBoyManager = busBoyManager;
