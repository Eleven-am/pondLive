export const getChanges = (diffedObject: any): any => {
    const changed: any = {};
    for (const key in diffedObject) {
        if (diffedObject[key].type === "created" || diffedObject[key].type === "updated")
            changed[key] = diffedObject[key].data;

        else if (diffedObject[key].type === "deleted")
            changed[key] = null;

        else if (typeof diffedObject[key] === "object") {
            const data = getChanges(diffedObject[key]);
            if (data && Object.keys(data).length > 0)
                changed[key] = data;
        }
    }
    return changed;
}

// merge two objects together by updating the first object with the second object
export const mergeObjects = (obj1: any, obj2: any): any => {
    if (obj1 === undefined)
        return obj2;

    if (obj2 === undefined)
        return obj1;

    for (const key in obj2) {
        if (obj2[key] instanceof Object)
            obj1[key] = mergeObjects(obj1[key], obj2[key]);

        else if (obj2[key] === null)
            delete obj1[key];

        else
            obj1[key] = obj2[key];
    }

    return obj1;
}

