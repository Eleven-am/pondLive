"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeObjects = exports.getChanges = void 0;
const getChanges = (diffedObject) => {
    const changed = {};
    for (const key in diffedObject) {
        if (diffedObject[key].type === "created" || diffedObject[key].type === "updated")
            changed[key] = diffedObject[key].data;
        else if (typeof diffedObject[key] === "object") {
            const data = (0, exports.getChanges)(diffedObject[key]);
            if (data && Object.keys(data).length > 0)
                changed[key] = data;
        }
    }
    return changed;
};
exports.getChanges = getChanges;
// merge two objects together by updating the first object with the second object
const mergeObjects = (obj1, obj2) => {
    if (obj1 === undefined)
        return obj2;
    if (obj2 === undefined)
        return obj1;
    for (const key in obj2) {
        if (obj2[key] instanceof Object)
            obj1[key] = (0, exports.mergeObjects)(obj1[key], obj2[key]);
        else
            obj1[key] = obj2[key];
    }
    return obj1;
};
exports.mergeObjects = mergeObjects;
