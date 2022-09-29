"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const basePromise_1 = require("./basePromise");
describe('BasePromise', () => {
    it('should resolve to a value T', async () => {
        const promise = (0, basePromise_1.BasePromise)({}, (resolve, _reject) => {
            resolve(5);
        });
        const result = await promise;
        expect(result).toBe(5);
    });
    it('should reject to a PondError<V>', async () => {
        const promise = (0, basePromise_1.BasePromise)({}, (_resolve, reject) => {
            reject('Something went wrong');
        });
        await expect(promise).rejects.toEqual(new basePromise_1.PondError('Something went wrong', 500, {}));
    });
    it('should reject an error if the promise is not resolved or rejected', async () => {
        const promise = (0, basePromise_1.BasePromise)({}, (_resolve, _reject) => { });
        await expect(promise).rejects.toEqual(new basePromise_1.PondError('Function did not resolve a Promise', 500, {}));
    });
    it('should always reject an instance of PondError', async () => {
        const promise = (0, basePromise_1.BasePromise)({}, (_resolve, _reject) => {
            throw new Error('Something went wrong');
        });
        const promise2 = (0, basePromise_1.BasePromise)({}, (_resolve, _reject) => {
            throw new basePromise_1.PondError('Something went wrong', 500, {});
        });
        await expect(promise).rejects.toEqual(new basePromise_1.PondError('Something went wrong', 500, {}));
        await expect(promise2).rejects.toEqual(new basePromise_1.PondError('Something went wrong', 500, {}));
    });
});
