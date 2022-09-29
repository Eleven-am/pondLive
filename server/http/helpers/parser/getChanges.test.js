"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getChanged_1 = require("./getChanged");
describe('getChanges', () => {
    it('should be able to get only changed properties1', () => {
        const obj = {
            a: {
                type: 'unchanged',
                data: 1,
            }
        };
        const result = (0, getChanged_1.getChanges)(obj);
        expect(result).toEqual({});
        // since no changes were made, the result should be an empty object
    });
    it('should be able to get only changed properties2', () => {
        const obj = {
            0: {
                a: {
                    type: 'updated',
                    data: 2,
                }
            },
            1: {
                type: 'created',
                data: 3,
            }
        };
        const result = (0, getChanged_1.getChanges)(obj);
        expect(result).toEqual({ 0: { a: 2 }, 1: 3 });
        // since a property was updated, the result should be an object with the updated property
    });
    it('should be able to get only changed properties3', () => {
        const obj = {
            3: {
                a: {
                    type: 'created',
                    data: 2,
                },
                b: {
                    type: 'deleted',
                    data: 3,
                },
                c: {
                    type: 'unchanged',
                    data: 4,
                },
                d: {
                    type: 'updated',
                    data: 5,
                }
            }
        };
        const result = (0, getChanged_1.getChanges)(obj);
        expect(result).toEqual({ 3: { a: 2, d: 5 } });
    });
    it('should be able to get only changed properties4', () => {
        const obj = {
            '0': { type: 'unchanged', data: 'test' },
            '1': { type: 'updated', data: 'Hello World 2' },
            s: {
                '0': { type: 'unchanged', data: '<div class="' },
                '1': { type: 'unchanged', data: '">' },
                '2': { type: 'unchanged', data: '</div>' }
            }
        };
        const result = (0, getChanged_1.getChanges)(obj);
        expect(result).toEqual({ '1': 'Hello World 2' });
    });
});
describe('mergeObjects', () => {
    it('should be able to merge two objects1', () => {
        const obj1 = {
            a: 1,
            b: 2,
            c: 3,
        };
        const obj2 = {
            a: 2,
            d: 4,
        };
        const result = (0, getChanged_1.mergeObjects)(obj1, obj2);
        expect(result).toEqual({
            a: 2,
            b: 2,
            c: 3,
            d: 4,
        });
    });
    it('should be able to merge two objects2', () => {
        const obj1 = {
            a: 1,
            b: {
                c: 2,
                d: 3,
            },
        };
        const obj2 = {
            a: 2,
            b: {
                c: 4,
                e: 5,
            },
        };
        const result = (0, getChanged_1.mergeObjects)(obj1, obj2);
        expect(result).toEqual({
            a: 2,
            b: {
                c: 4,
                d: 3,
                e: 5,
            },
        });
    });
    it('should be able to merge two objects3', () => {
        const obj1 = undefined;
        const obj2 = {
            a: 2,
            b: {
                c: 4,
            }
        };
        const result = (0, getChanged_1.mergeObjects)(obj1, obj2);
        expect(result).toEqual(obj2);
        const result2 = (0, getChanged_1.mergeObjects)(obj2, obj1);
        expect(result2).toEqual(obj2);
    });
});
