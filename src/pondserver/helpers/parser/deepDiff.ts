export const DeepDiffMapper = (obj1: Record<string, any> | undefined, obj2: Record<string, any>): Record<string, any> => {
    const isFunction = (x: any): boolean => {
        return Object.prototype.toString.call(x) === '[object Function]';
    }

    const isArray = (x: any): boolean => {
        return Object.prototype.toString.call(x) === '[object Array]';
    }

    const isDate = (x: any): boolean => {
        return Object.prototype.toString.call(x) === '[object Date]';
    }

    const isObject = (x: any): boolean => {
        return Object.prototype.toString.call(x) === '[object Object]';
    }

    const isValue = (x: any): boolean => {
        return !isObject(x) && !isArray(x);
    }

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
    }

    const map = (obj1: Record<string, any> | undefined, obj2: Record<string, any>): Record<string, any> => {
        if (isFunction(obj1) || isFunction(obj2)) {
            throw 'Invalid argument. Function given, object expected.';
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
                data: obj1 === undefined ? obj2 : obj1
            };
        }

        const diff: Record<string, any> = {};
        for (const key in obj1) {
            if (isFunction(obj1[key])) {
                continue;
            }

            let value2 = undefined;
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
    }

    return map(obj1, obj2);
}
