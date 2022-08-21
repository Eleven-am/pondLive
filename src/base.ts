export class BaseClass {

    /**
     * @desc creates an uuid v4 string
     */
    public createUUID() {
        let dt = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    /**
     * @desc encodes an object using into a string using it's secret key
     * @param salt - the secret key
     * @param text - the object to encode
     */
    public encrypt(salt: string, text: any) {
        const textToChars = (text: string) => text.split("").map((c) => c.charCodeAt(0));
        const byteHex = (n: number) => ("0" + Number(n).toString(16)).substr(-2);
        const applySaltToChar = (code: any) => textToChars(salt).reduce((a, b) => a ^ b, code);

        const token = JSON.stringify(text)
            .split("")
            .map(textToChars)
            .map(applySaltToChar)
            .map(byteHex)
            .join("");

        return btoa(token).toString();
    }

}

export interface RejectPromise <T> {
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

export function BasePromise<T, V>(callback: (resolve: (value: T) => void, reject: (errorMessage: string, errorCode: number, data: V) => void) => void) {
    return new Promise<T>((resolve, reject) => {
        const myReject = (errorMessage: string, errorCode: number, data: V) => {
            reject(new PondError(errorMessage, errorCode, data));
        }

        callback(resolve, myReject);
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
    public toArray(): Array<B & {id: A}> {
        return Array.from(this.map.entries(), ([key, value]) => ({id: key, ...value}));
    }
    public deleteKey(key: A): this {
        this.map.delete(key);
        return this;
    }
    public allExcept(...keys: A[]) {
        const cache: Array<B & {id: A}> = [];
        Array.from(this.map.entries(), ([key, value]) => {
            if (keys.indexOf(key) === -1)
                cache.push({id: key, ...value});
        }).filter(x => x);
        return cache;
    }
}
