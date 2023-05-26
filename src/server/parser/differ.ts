export const differ = (obj1: Record<string, any> | undefined, obj2: Record<string, any>): Record<string, any> => {
    const isFunction = (x: any): boolean => Object.prototype.toString.call(x) === '[object Function]';

    const isArray = (x: any): boolean => Object.prototype.toString.call(x) === '[object Array]';

    const isDate = (x: any): boolean => Object.prototype.toString.call(x) === '[object Date]';

    const isObject = (x: any): boolean => Object.prototype.toString.call(x) === '[object Object]';

    const isValue = (x: any): boolean => !isObject(x) && !isArray(x);

    const compareValues = (value1: any, value2: any): string => {
        if (value1 === value2) {
            return 'unchanged';
        }
        if (isDate(value1) && isDate(value2) && value1.getTime() === value2.getTime()) {
            return 'unchanged';
        }
        if (value1 === undefined) {
            return 'created';
        }
        if (value2 === undefined) {
            return 'deleted';
        }

        return 'updated';
    };

    const map = (obj1: Record<string, any> | undefined, obj2: Record<string, any>): Record<string, any> => {
        if (isFunction(obj1) || isFunction(obj2)) {
            throw new Error('Invalid argument. Function given, object expected.');
        }
        if (isValue(obj1) || isValue(obj2)) {
            const newType = compareValues(obj1, obj2);

            if (newType === 'updated') {
                return {
                    type: newType,
                    data: obj2,
                };
            }

            return {
                type: newType,
                data: obj1 === undefined ? obj2 : obj1,
            };
        }

        const diff: Record<string, any> = {};

        for (const key in obj1) {
            if (isFunction(obj1[key])) {
                continue;
            }

            let value2;

            if (obj2[key] !== undefined) {
                value2 = obj2[key];
            }

            diff[key] = map(obj1[key], value2);
        }

        for (const key in obj2) {
            if (isFunction(obj2[key]) || diff[key] !== undefined) {
                continue;
            }

            diff[key] = map(undefined, obj2[key]);
        }

        return diff;
    };

    return map(obj1, obj2);
};

export const getChanges = (diffedObject: any): any => {
    const changed: any = {};

    for (const key in diffedObject) {
        if (diffedObject[key]) {
            if (diffedObject[key].type === 'created' || diffedObject[key].type === 'updated') {
                changed[key] = diffedObject[key].data;
            } else if (diffedObject[key].type === 'deleted') {
                changed[key] = null;
            } else if (typeof diffedObject[key] === 'object') {
                const data = getChanges(diffedObject[key]);

                if (data && Object.keys(data).length > 0) {
                    changed[key] = data;
                }
            }
        }
    }

    return changed;
};

export const mergeObjects = (obj1: any, obj2: any): any => {
    if (obj1 === undefined) {
        return obj2;
    }

    if (obj2 === undefined) {
        return obj1;
    }

    if (Array.isArray(obj1)) {
        const mapped: any = obj1.map((item: any, index: number) => {
            if (obj2[index] !== undefined && obj2[index] !== null) {
                return mergeObjects(item, obj2[index]);
            }

            return item;
        });

        for (const key in obj2) {
            if (mapped[key] === undefined) {
                mapped[key] = obj2[key];
            }
        }

        return mapped;
    }

    for (const key in obj2) {
        if (obj2[key] instanceof Object) {
            obj1[key] = mergeObjects(obj1[key], obj2[key]);
        } else if (obj2[key] === null) {
            delete obj1[key];
        } else {
            obj1[key] = obj2[key];
        }
    }

    return obj1;
};
