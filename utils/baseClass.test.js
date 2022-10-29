"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var baseClass_1 = require("./baseClass");
describe('BaseClass', function () {
    var baseClass = new baseClass_1.BaseClass();
    it('should always return a uuid v4 string', function () {
        expect(baseClass.uuid()).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/);
    });
    it('should return the query of string', function () {
        var string = '/test/5?test=5';
        var secondString = '/test/5?test=5&test2=6';
        expect(baseClass['_parseQueries'](string)).toEqual({ test: '5' });
        expect(baseClass['_parseQueries'](secondString)).toEqual({ test: '5', test2: '6' });
    });
    it('should be able to match partial strings to patterns', function () {
        var pattern = 'pondSocket:test';
        var string = 'pondSockethello?test=5&test2=6';
        var unMatchingString = 'pondXocket2hello?test=5&test2=6';
        var secondPattern = 'pondSocket:test/:id';
        var secondString = 'pondSockethello/5?test=5&test2=6';
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
    it('should be capable of encrypting and decrypting a string', function () {
        var string = 'hello';
        var salt = 'test';
        var encryptedString = baseClass.encrypt(salt, string);
        expect(baseClass.decrypt(salt, encryptedString)).toEqual(string);
    });
    it('should not be capable of encrypting and decrypting a string with a different salt', function () {
        var string = { test: 5 };
        var salt = 'test';
        var secondSalt = 'test2';
        var encryptedString = baseClass.encrypt(salt, string);
        expect(baseClass.decrypt(secondSalt, encryptedString)).toEqual(null);
    });
    it('should generate a random nanoId string', function () {
        var string = baseClass.nanoId();
        expect(string.length).toEqual(8);
        var secondString = baseClass.nanoId();
        expect(secondString.length).toEqual(8);
        expect(string).not.toEqual(secondString);
    });
    it('should match strings a little loosely with the getLiveRequest function', function () {
        var pattern = 'pondSocket:test';
        var string = 'pondSockethello?test=5&test2=6';
        var unMatchingString = 'pondXocket2hello?test=5&test2=6';
        var secondPattern = 'pondSocket:test/:id';
        var secondString = 'pondSockethello/5?test=5&test2=6';
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
        var newPattern = '/pondSocket/test';
        var newString = '/pondSocket/test/test?james=5&test2=6';
        expect(baseClass.getLiveRequest(newPattern, newString)).toEqual({
            address: newString,
            params: {},
            query: { james: '5', test2: '6' },
            nextPath: '/test?james=5&test2=6'
        });
        var thirdPattern = '/pondSocket';
        var thirdString = '/pondSocket';
        expect(baseClass.getLiveRequest(thirdPattern, thirdString)).toEqual({
            address: thirdString,
            params: {},
            query: {},
            nextPath: ''
        });
    });
});
