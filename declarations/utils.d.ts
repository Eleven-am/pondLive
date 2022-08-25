import { PondResponse, PondResponseAssigns } from "../index";
export declare class BaseClass {
    /**
     * @desc creates an uuid v4 string
     */
    uuid(): string;
    /**
     * @desc compares string to string | regex
     * @param string - the string to compare to the pattern
     * @param pattern - the pattern to compare to the string
     */
    compareStringToPattern(string: string, pattern: string | RegExp): boolean;
    /**
     * @desc replaces an object in an array with the new object by a specified key
     * @param array - the array to replace the object in
     * @param key - the key to search for in the array
     * @param newObject - the new object to replace the old one with
     */
    replaceObjectInArray<A, B extends keyof A>(array: A[], key: B, newObject: A): A[];
    /**
     * @desc generates a pond response given the data, resolve and reject functions
     * @param data - the data to return to the response
     * @param resolve - the resolve function to call when the response is accepted
     * @param rejected - the reject function to call when the response is rejected
     */
    generatePondResponse<T>(resolve: (value: PondResponseAssigns) => void, rejected: (errorMessage: string, errorCode: number, data: T) => void, data: T): PondResponse;
}
export interface RejectPromise<T> {
    errorMessage: string;
    errorCode: number;
    data: T;
}
export declare class PondError<T> implements RejectPromise<T> {
    errorMessage: string;
    errorCode: number;
    data: T;
    constructor(errorMessage: string, errorCode: number, data: T);
}
export declare function BasePromise<T, V>(callback: (resolve: (value: T) => void, reject: (errorMessage: string, errorCode: number, data: V) => void) => void, data: V): Promise<T>;
export declare class BaseMap<A, B> {
    private map;
    constructor(entries?: [A, B][] | Map<A, B> | BaseMap<A, B>);
    set(key: A, value: B): Map<A, B>;
    get(key: A): B | undefined;
    has(key: A): boolean;
    keys(): IterableIterator<A>;
    toArray(): Array<B & {
        id: A;
    }>;
    toKeyValueArray(): Array<{
        key: A;
        value: B;
    }>;
    deleteKey(key: A): this;
    allExcept(...keys: A[]): (B & {
        id: A;
    })[];
    find(callback: (value: B) => boolean): {
        key: A;
        value: B;
    } | undefined;
    findByKey(callback: (value: A) => boolean): {
        key: A;
        value: B;
    } | undefined;
    toArrayMap<T>(callback: ([key, value]: [A, B]) => T): T[];
}
