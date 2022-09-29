"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePromise = exports.PondError = void 0;
class PondError {
    errorMessage;
    errorCode;
    data;
    constructor(errorMessage, errorCode, data) {
        this.errorMessage = errorMessage;
        this.errorCode = errorCode;
        this.data = data;
    }
    ;
}
exports.PondError = PondError;
function BasePromise(data, callback) {
    return new Promise(async (resolve, reject) => {
        let validated = false;
        const myReject = (errorMessage, errorCode) => {
            validated = true;
            reject(new PondError(errorMessage, errorCode || 500, data));
        };
        const myResolve = async (value) => {
            validated = true;
            resolve(value);
        };
        try {
            await callback(myResolve, myReject);
            if (!validated)
                reject(new PondError('Function did not resolve a Promise', 500, data));
        }
        catch (error) {
            if (error instanceof PondError)
                reject(error);
            else
                reject(new PondError(error.message, 500, data));
        }
    });
}
exports.BasePromise = BasePromise;
