"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadMessage = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class UploadMessage {
    constructor(files) {
        this._files = files;
    }
    get files() {
        return this._files.map(e => this._createPondFile(e));
    }
    /**
     * @desc Accepts the file and moves it to the specified directory
     * @param file - The file to accept
     * @param directory - The directory to move the file to
     */
    async _acceptFile(file, directory) {
        if (!await this._folderExists(directory))
            await this._createFolder(directory);
        await this._moveFile(file, directory);
    }
    /**
     * @desc Checks if the folder exists
     * @param directory - The directory to check
     * @private
     */
    _folderExists(directory) {
        return new Promise((resolve, _reject) => {
            fs_1.default.access(directory, fs_1.default.constants.F_OK, (err) => {
                if (err)
                    return resolve(false);
                return resolve(true);
            });
        });
    }
    /**
     * @desc Creates the folder
     * @param directory - The directory to create
     * @private
     */
    _createFolder(directory) {
        return new Promise((resolve, reject) => {
            fs_1.default.mkdir(directory, (err) => {
                if (err)
                    return reject(err);
                return resolve();
            });
        });
    }
    /**
     * @desc Moves the file to the specified directory
     * @param file - The file to move
     * @param directory - The directory to move the file to
     * @private
     */
    _moveFile(file, directory) {
        return new Promise((resolve, reject) => {
            const filePath = path_1.default.join(directory, file.name);
            fs_1.default.rename(file.tempPath, filePath, (err) => {
                if (err)
                    return reject(err);
                return resolve();
            });
        });
    }
    /**
     * \desc Deletes the file from the temporary directory
     * @param file - The file to delete
     * @private
     */
    _deleteFile(file) {
        return new Promise((resolve, reject) => {
            fs_1.default.unlink(file.tempPath, (err) => {
                if (err)
                    return reject(err);
                return resolve();
            });
        });
    }
    /**
     * @desc Creates a pond file from the file upload
     * @param file - The file to create the pond file from
     * @private
     */
    _createPondFile(file) {
        return {
            name: file.name,
            size: file.size,
            mimetype: file.mimetype,
            filePath: file.filePath,
            destroy: () => this._deleteFile(file),
            move: (directory) => this._acceptFile(file, directory),
        };
    }
}
exports.UploadMessage = UploadMessage;
