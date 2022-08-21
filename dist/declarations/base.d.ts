export declare class BaseClass {
    /**
     * @desc creates an uuid v4 string
     */
    createUUID(): string;
    /**
     * @desc encodes an object using into a string using it's secret key
     * @param salt - the secret key
     * @param text - the object to encode
     */
    encrypt(salt: string, text: any): string;
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
export declare function BasePromise<T, V>(callback: (resolve: (value: T) => void, reject: (errorMessage: string, errorCode: number, data: V) => void) => void): Promise<T>;
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
    deleteKey(key: A): this;
    allExcept(...keys: A[]): (B & {
        id: A;
    })[];
}
