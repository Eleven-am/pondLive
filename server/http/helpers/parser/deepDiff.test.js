"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const deepDiff_1 = require("./deepDiff");
describe('DeepDiffMapper', () => {
    it('should return unchanged if both objects are the same', () => {
        const obj1 = {
            a: 1,
            b: 2,
            c: 3,
        };
        const obj2 = {
            a: 1,
            b: 2,
            c: 3,
        };
        const result = (0, deepDiff_1.DeepDiffMapper)(obj1, obj2);
        expect(result).toEqual({
            a: {
                type: 'unchanged',
                data: 1,
            },
            b: {
                type: 'unchanged',
                data: 2,
            },
            c: {
                type: 'unchanged',
                data: 3,
            },
        });
    });
    it('should return created if the first object is undefined', () => {
        const obj1 = undefined;
        const obj2 = {
            a: 1,
            b: 2,
            c: 3,
        };
        const result = (0, deepDiff_1.DeepDiffMapper)(obj1, obj2);
        expect(result).toEqual({
            type: 'created',
            data: {
                a: 1,
                b: 2,
                c: 3,
            }
        });
    });
    it('should return deleted if the second object is undefined', () => {
        const obj1 = {
            a: 1,
            b: 2,
            c: 3,
        };
        const result = (0, deepDiff_1.DeepDiffMapper)(obj1, {});
        expect(result).toEqual({
            a: {
                type: 'deleted',
                data: 1,
            },
            b: {
                type: 'deleted',
                data: 2,
            },
            c: {
                type: 'deleted',
                data: 3,
            },
        });
    });
    it('should be able to handle nested objects', () => {
        const obj1 = {
            a: 1,
            b: {
                c: 2,
                d: 3,
            },
        };
        const obj2 = {
            a: 1,
            b: {
                c: 2,
                d: 4,
            },
        };
        const result = (0, deepDiff_1.DeepDiffMapper)(obj1, obj2);
        expect(result).toEqual({
            a: {
                type: 'unchanged',
                data: 1,
            },
            b: {
                c: {
                    type: 'unchanged',
                    data: 2,
                },
                d: {
                    type: 'updated',
                    data: 4,
                },
            },
        });
    });
    it('should throw an error if 2 functions are passed', () => {
        const obj1 = () => {
        };
        const obj2 = () => {
        };
        expect(() => (0, deepDiff_1.DeepDiffMapper)(obj1, obj2)).toThrow('Invalid argument. Function given, object expected.');
    });
    it('should throw an error if 1 function and 1 object are passed', () => {
        const obj1 = () => {
        };
        const obj2 = {
            a: 1,
        };
        expect(() => (0, deepDiff_1.DeepDiffMapper)(obj1, obj2)).toThrow('Invalid argument. Function given, object expected.');
    });
    it('should throw an error if 1 object and 1 function are passed', () => {
        const obj1 = {
            a: 1,
        };
        const obj2 = () => {
        };
        expect(() => (0, deepDiff_1.DeepDiffMapper)(obj1, obj2)).toThrow('Invalid argument. Function given, object expected.');
    });
    it('should ignore a nestd function', () => {
        const obj1 = {
            a: 1,
            b: {
                c: 2,
                d: () => {
                },
            },
        };
        const obj2 = {
            a: 1,
            b: {
                c: 2,
                d: 4,
            },
        };
        const result = (0, deepDiff_1.DeepDiffMapper)(obj1, obj2);
        expect(result).toEqual({
            a: {
                type: 'unchanged',
                data: 1,
            },
            b: {
                c: {
                    type: 'unchanged',
                    data: 2,
                },
                d: {
                    type: 'created',
                    data: 4,
                },
            },
        });
    });
    it('should compare dates', () => {
        const obj1 = {
            a: 1,
            b: new Date('2019-01-01'),
        };
        const obj2 = {
            a: 1,
            b: new Date('2019-01-02'),
        };
        const result = (0, deepDiff_1.DeepDiffMapper)(obj1, obj2);
        expect(result).toEqual({
            a: {
                type: 'unchanged',
                data: 1,
            },
            b: {
                type: 'updated',
                data: new Date('2019-01-02'),
            },
        });
        // equal dates
        const obj3 = {
            a: 1,
            b: new Date('2019-01-01'),
        };
        const result2 = (0, deepDiff_1.DeepDiffMapper)(obj1, obj3);
        expect(result2).toEqual({
            a: {
                type: 'unchanged',
                data: 1,
            },
            b: {
                type: 'unchanged',
                data: new Date('2019-01-01'),
            }
        });
    });
    it('should compare arrays', () => {
        const obj1 = {
            a: 1,
            b: [1, 2, 3],
        };
        const obj2 = {
            a: 1,
            b: [1, 2, 4],
        };
        const result = (0, deepDiff_1.DeepDiffMapper)(obj1, obj2);
        expect(result).toEqual({
            a: {
                type: 'unchanged',
                data: 1,
            },
            b: {
                0: {
                    type: 'unchanged',
                    data: 1,
                },
                1: {
                    type: 'unchanged',
                    data: 2,
                },
                2: {
                    type: 'updated',
                    data: 4,
                }
            },
        });
    });
});
