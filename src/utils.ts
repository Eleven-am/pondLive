import {PondResponse, PondResponseAssigns} from "./channel";

export class BaseClass {

    /**
     * @desc creates an uuid v4 string
     */
    public uuid() {
        let dt = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    /**
     * @desc compares string to string | regex
     * @param string - the string to compare to the pattern
     * @param pattern - the pattern to compare to the string
     */
    public compareStringToPattern(string: string, pattern: string | RegExp) {
        if (typeof pattern === 'string')
            return string === pattern;
        else {
            return pattern.test(string);
        }
    }

    /**
     * @desc replaces an object in an array with the new object by a specified key
     * @param array - the array to replace the object in
     * @param key - the key to search for in the array
     * @param newObject - the new object to replace the old one with
     */
    public replaceObjectInArray<A, B extends keyof A>(array: A[], key: B, newObject: A) {
        return array.map((item) => {
            if (item[key] === newObject[key]) {
                return newObject;
            } else {
                return item;
            }
        });
    }

    /**
     * @desc generates a pond response given the data, resolve and reject functions
     * @param data - the data to return to the response
     * @param resolve - the resolve function to call when the response is accepted
     * @param rejected - the reject function to call when the response is rejected
     */
    public generatePondResponse<T>(resolve: (value: PondResponseAssigns) => void, rejected: (errorMessage: string, errorCode: number, data: T) => void, data: T): PondResponse {
        const accept = (data?: PondResponseAssigns) => {
            const assigns = data?.assign || {};
            const presence = data?.presence || {};
            const channelData = data?.channelData || {};
            resolve({
                assign: assigns,
                presence: presence,
                channelData: channelData
            });
        }

        const reject = (message?: string, statusCode?: number) => {
            rejected(message || 'Something went wrong', statusCode || 500, data);
        }

        return {
            accept: accept,
            reject: reject,
        }
    }

    /**
     * @desc Checks if the given object is empty
     * @param obj - the object to check
     */
    public isObjectEmpty(obj: object) {
        return Object.keys(obj).length === 0;
    }
}

export interface RejectPromise<T> {
    errorMessage: string
    errorCode: number;
    data: T;
}

export class PondError<T> implements RejectPromise<T> {
    errorMessage: string;
    errorCode: number;
    data: T;

    constructor(errorMessage: string, errorCode: number, data: T) {
        this.errorMessage = errorMessage;
        this.errorCode = errorCode;
        this.data = data;
    };
}

export function BasePromise<T, V>(callback: (resolve: (value: T) => void, reject: (errorMessage: string, errorCode: number, data: V) => void) => void, data: V): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {
        let validated = false;
        const myReject = (errorMessage: string, errorCode: number, data: V) => {
            validated = true;
            reject(new PondError(errorMessage, errorCode, data));
        }

        const myResolve =  (value: (T | PromiseLike<T>)) => {
            validated = true;
            resolve(value);
        }

        try {
            await callback(myResolve, myReject);
            if (!validated)
                reject(new PondError('Function did not resolve a Promise', 500, data));
        } catch (error: any) {
            reject(new PondError(error.message, 500, data));
        }
    })
}

export class BaseMap<A, B> {
    private map: Map<A, B>;

    constructor(entries?: [A, B][] | Map<A, B> | BaseMap<A, B>) {
        if (entries instanceof BaseMap)
            this.map = entries.map;

        else if (entries instanceof Map)
            this.map = new Map<A, B>(entries);

        else if (Array.isArray(entries))
            this.map = new Map<A, B>(entries);

        else
            this.map = new Map<A, B>();
    }

    public set(key: A, value: B) {
        return this.map.set(key, value);
    }

    public get(key: A) {
        return this.map.get(key);
    }

    public has(key: A) {
        return this.map.has(key);
    }

    public keys() {
        return this.map.keys();
    }

    public values() {
        return this.map.values();
    }

    public toArray(): Array<B & { id: A }> {
        return Array.from(this.map.entries(), ([key, value]) => ({id: key, ...value}));
    }

    public toKeyValueArray(): Array<{ key: A, value: B }> {
        return Array.from(this.map.entries(), ([key, value]) => ({key: key, value: value}));
    }

    public deleteKey(key: A): this {
        this.map.delete(key);
        return this;
    }

    public allExcept(...keys: A[]) {
        const cache: Array<B & { id: A }> = [];
        Array.from(this.map.entries(), ([key, value]) => {
            if (keys.indexOf(key) === -1)
                cache.push({id: key, ...value});
        }).filter(x => x);
        return cache;
    }

    public find(callback: (value: B) => boolean) {
        const cache = this.toKeyValueArray();
        return cache.find(item => callback(item.value));
    }

    public findByKey(callback: (value: A) => boolean) {
        const cache = this.toKeyValueArray();
        return cache.find(item => callback(item.key));
    }

    public toArrayMap<T>(callback: ([key, value]: [A, B]) => T) {
        const cache = this.toKeyValueArray();
        return cache.map(item => callback([item.key, item.value]));
    }
}
