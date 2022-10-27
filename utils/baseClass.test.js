"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baseClass_1 = require("./baseClass");
describe('BaseClass', () => {
    const baseClass = new baseClass_1.BaseClass();
    it('should always return a uuid v4 string', () => {
        expect(baseClass.uuid()).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/);
    });
    it('should return the query of string', () => {
        const string = '/test/5?test=5';
        const secondString = '/test/5?test=5&test2=6';
        expect(baseClass['_parseQueries'](string)).toEqual({ test: '5' });
        expect(baseClass['_parseQueries'](secondString)).toEqual({ test: '5', test2: '6' });
    });
    it('should be able to match partial strings to patterns', () => {
        const pattern = 'pondSocket:test';
        const string = 'pondSockethello?test=5&test2=6';
        const unMatchingString = 'pondXocket2hello?test=5&test2=6';
        const secondPattern = 'pondSocket:test/:id';
        const secondString = 'pondSockethello/5?test=5&test2=6';
        expect(baseClass['_matchPartialPattern'](string, pattern)).toEqual({
            params: { test: 'hello' },
            rest: '?test=5&test2=6'
        });
        expect(baseClass['_matchPartialPattern'](secondString, pattern)).toEqual({
            params: { test: 'hello' },
            rest: '/5?test=5&test2=6'
        });
        expect(baseClass['_matchPartialPattern'](unMatchingString, pattern)).toEqual(null);
        expect(baseClass['_matchPartialPattern'](secondString, secondPattern)).toEqual({
            params: { test: 'hello', id: '5' },
            rest: '?test=5&test2=6'
        });
    });
    it('should be capable of encrypting and decrypting a string', () => {
        const string = 'hello';
        const salt = 'test';
        const encryptedString = baseClass.encrypt(salt, string);
        expect(baseClass.decrypt(salt, encryptedString)).toEqual(string);
    });
    it('should not be capable of encrypting and decrypting a string with a different salt', () => {
        const string = { test: 5 };
        const salt = 'test';
        const secondSalt = 'test2';
        const encryptedString = baseClass.encrypt(salt, string);
        expect(baseClass.decrypt(secondSalt, encryptedString)).toEqual(null);
    });
    it('should generate a random nanoId string', () => {
        const string = baseClass.nanoId();
        expect(string.length).toEqual(8);
        const secondString = baseClass.nanoId();
        expect(secondString.length).toEqual(8);
        expect(string).not.toEqual(secondString);
    });
    it('should match strings a little loosely with the getLiveRequest function', () => {
        const pattern = 'pondSocket:test';
        const string = 'pondSockethello?test=5&test2=6';
        const unMatchingString = 'pondXocket2hello?test=5&test2=6';
        const secondPattern = 'pondSocket:test/:id';
        const secondString = 'pondSockethello/5?test=5&test2=6';
        expect(baseClass.getLiveRequest(pattern, string)).toEqual({
            address: string,
            params: { test: 'hello' },
            query: { test: '5', test2: '6' },
            nextPath: '?test=5&test2=6'
        });
        expect(baseClass.getLiveRequest(pattern, secondString)).toEqual({
            address: secondString,
            params: { test: 'hello' },
            query: { test: '5', test2: '6' },
            nextPath: '/5?test=5&test2=6'
        });
        expect(baseClass.getLiveRequest(pattern, unMatchingString)).toEqual(null);
        expect(baseClass.getLiveRequest(secondPattern, secondString)).toEqual({
            address: secondString,
            params: { test: 'hello', id: '5' },
            query: { test: '5', test2: '6' },
            nextPath: '?test=5&test2=6'
        });
        const newPattern = '/pondSocket/test';
        const newString = '/pondSocket/test/test?james=5&test2=6';
        expect(baseClass.getLiveRequest(newPattern, newString)).toEqual({
            address: newString,
            params: {},
            query: { james: '5', test2: '6' },
            nextPath: '/test?james=5&test2=6'
        });
        const thirdPattern = '/pondSocket';
        const thirdString = '/pondSocket';
        expect(baseClass.getLiveRequest(thirdPattern, thirdString)).toEqual({
            address: thirdString,
            params: {},
            query: {},
            nextPath: ''
        });
    });
});
