"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
const cssGenerator_1 = require("./cssGenerator");
describe('html parser', () => {
    it('should parse a simple html string', () => {
        const className = 'test';
        const message = 'Hello World';
        const string = (0, parser_1.html) `<div class="${className}">${message}</div>`;
        expect(string.getParts()).toEqual({
            0: 'test', 1: 'Hello World', s: ['<div class="', '">', '</div>']
        });
    });
    it('should parse a html string with multiple dynamic values', () => {
        const className = 'test';
        const message = 'Hello World';
        const secondClassName = 'test2';
        const secondMessage = 'Hello again';
        const string = (0, parser_1.html) `<div class="${className}">${message}<span class="${secondClassName}">${secondMessage}</span></div>`;
        expect(string.getParts()).toEqual({
            0: 'test',
            1: 'Hello World',
            2: 'test2',
            3: 'Hello again',
            s: ['<div class="', '">', '<span class="', '">', '</span></div>']
        });
    });
    it('should parse a html string with nested dynamic values', () => {
        const firsName = 'John';
        const lastName = 'Doe';
        const age = 42;
        const address = '1 Park Avenue';
        const className = 'test';
        const secondClassName = 'test2';
        const string = (0, parser_1.html) `<div class="${className}">${(0, parser_1.html) `<div class="${secondClassName}">${firsName} ${lastName} is ${age} years old and lives at ${address}</div>`}</div>`;
        expect(string.getParts()).toEqual({
            0: 'test', 1: {
                0: 'test2',
                1: 'John',
                2: 'Doe',
                3: 42,
                4: '1 Park Avenue',
                s: ['<div class="', '">', ' ', ' is ', ' years old and lives at ', '</div>']
            }, s: ['<div class="', '">', '</div>']
        });
    });
    it('should parse a html string with nested dynamic values and multiple dynamic values', () => {
        const list = (name, age) => (0, parser_1.html) `<li>${name} is ${age} years old</li>`;
        const users = [{ name: 'John', age: 42 }, { name: 'Jane', age: 43 }, { name: 'Jack', age: 44 },];
        const string = (0, parser_1.html) `<ul>${users.map(user => list(user.name, user.age))}</ul>`;
        expect(string.getParts()).toEqual({
            0: {
                0: {
                    0: 'John', 1: 42, s: ['<li>', ' is ', ' years old</li>']
                }, 1: {
                    0: 'Jane', 1: 43, s: ['<li>', ' is ', ' years old</li>']
                }, 2: {
                    0: 'Jack', 1: 44, s: ['<li>', ' is ', ' years old</li>']
                }, s: ['', '', '', '']
            }, s: ['<ul>', '</ul>']
        });
        const newUsers = users.concat([{ name: 'Jill', age: 45 }]);
        const newString = (0, parser_1.html) `<ul>${newUsers.map(user => list(user.name, user.age))}</ul>`;
        expect(newString.getParts()).toEqual({
            0: {
                0: {
                    0: 'John', 1: 42, s: ['<li>', ' is ', ' years old</li>']
                }, 1: {
                    0: 'Jane', 1: 43, s: ['<li>', ' is ', ' years old</li>']
                }, 2: {
                    0: 'Jack', 1: 44, s: ['<li>', ' is ', ' years old</li>']
                }, 3: {
                    0: 'Jill', 1: 45, s: ['<li>', ' is ', ' years old</li>']
                }, s: ['', '', '', '', '']
            }, s: ['<ul>', '</ul>']
        });
    });
    it('should return parsed html to string', () => {
        const parsed = {
            0: {
                0: {
                    0: 'John', 1: 42, s: ['<li>', ' is ', ' years old</li>']
                }, 1: {
                    0: 'Jane', 1: 43, s: ['<li>', ' is ', ' years old</li>']
                }, 2: {
                    0: 'Jack', 1: 44, s: ['<li>', ' is ', ' years old</li>']
                }, s: ['', '', '', '']
            }, s: ['<ul>', '</ul>']
        };
        const htmlString = (0, parser_1.html) ``;
        expect(htmlString.parsedHtmlToString(parsed)).toEqual('<ul><li>John is 42 years old</li><li>Jane is 43 years old</li><li>Jack is 44 years old</li></ul>');
    });
    it('should return parsed html to string with nested dynamic values', () => {
        const parsed = {
            0: 'test', 1: {
                0: 'test2',
                1: 'John',
                2: 'Doe',
                3: 42,
                4: '1 Park Avenue',
                s: ['<div class="', '">', ' ', ' is ', ' years old and lives at ', '</div>']
            }, s: ['<div class="', '">', '</div>']
        };
        const htmlString = (0, parser_1.html) ``;
        expect(htmlString.parsedHtmlToString(parsed)).toEqual('<div class="test"><div class="test2">John Doe is 42 years old and lives at 1 Park Avenue</div></div>');
    });
    it('should return parsed html to string with nested dynamic values and multiple dynamic values', () => {
        const parsed = {
            0: {
                0: {
                    0: 'John', 1: 42, s: ['<li>', ' is ', ' years old</li>']
                }, 1: {
                    0: 'Jane', 1: 43, s: ['<li>', ' is ', ' years old</li>']
                }, 2: {
                    0: 'Jack', 1: 44, s: ['<li>', ' is ', ' years old</li>']
                }, 3: {
                    0: 'Jill', 1: 45, s: ['<li>', ' is ', ' years old</li>']
                }, s: ['', '', '', '', '']
            }, s: ['<ul>', '</ul>']
        };
        const htmlString = (0, parser_1.html) ``;
        expect(htmlString.parsedHtmlToString(parsed)).toEqual('<ul><li>John is 42 years old</li><li>Jane is 43 years old</li><li>Jack is 44 years old</li><li>Jill is 45 years old</li></ul>');
    });
    it('should parse a html string to plain string', () => {
        const className = 'test';
        const message = 'Hello World';
        const string = (0, parser_1.html) `<div class="${className}">${message}</div>`;
        expect(string.toString()).toEqual('<div class="test">Hello World</div>');
    });
    it('should parse a html string with nested dynamic values to plain string', () => {
        const firsName = 'John';
        const lastName = 'Doe';
        const age = 42;
        const address = '1 Park Avenue';
        const className = 'test';
        const secondClassName = 'test2';
        const string = (0, parser_1.html) `<div class="${className}">${(0, parser_1.html) `<div class="${secondClassName}">${firsName} ${lastName} is ${age} years old and lives at ${address}</div>`}</div>`;
        expect(string.toString()).toEqual('<div class="test"><div class="test2">John Doe is 42 years old and lives at 1 Park Avenue</div></div>');
    });
    it('should parse a html string with nested dynamic values and multiple dynamic values to plain string', () => {
        const list = (name, age) => (0, parser_1.html) `<li>${name} is ${age} years old</li>`;
        const users = [{ name: 'John', age: 42 }, { name: 'Jane', age: 43 }, { name: 'Jack', age: 44 },];
        const string = (0, parser_1.html) `<ul>${users.map(user => list(user.name, user.age))}</ul>`;
        expect(string.toString()).toEqual('<ul><li>John is 42 years old</li><li>Jane is 43 years old</li><li>Jack is 44 years old</li></ul>');
    });
    it('should be able to tell the difference between two html strings', () => {
        const className = 'test';
        const message = 'Hello World';
        const message2 = 'Hello World 2';
        const string = (0, parser_1.html) `<div class="${className}">${message}</div>`;
        const string2 = (0, parser_1.html) `<div class="${className}">${message2}</div>`;
        expect(string.differentiate(string2)).toEqual({
            1: 'Hello World 2'
        });
    });
    it('should be able to tell the difference between two html strings with nested dynamic values', () => {
        const firsName = 'John';
        const lastName = 'Doe';
        const age = 42;
        const address = '1 Park Avenue';
        const secondAddress = '2 Park Avenue';
        const className = 'test';
        const secondClassName = 'test2';
        const string = (0, parser_1.html) `<div class="${className}">${(0, parser_1.html) `<div class="${secondClassName}">${firsName} ${lastName} is ${age} years old and lives at ${address}</div>`}</div>`;
        const string2 = (0, parser_1.html) `<div class="${className}">${(0, parser_1.html) `<div class="${secondClassName}">${firsName} ${lastName} is ${age} years old and lives at ${secondAddress}</div>`}</div>`;
        expect(string.differentiate(string2)).toEqual({
            1: {
                4: '2 Park Avenue'
            }
        });
    });
    it('should be able to tell the difference between two html strings with nested dynamic values and multiple dynamic values', () => {
        const list = (name, age) => (0, parser_1.html) `<li>${name} is ${age} years old</li>`;
        const users = [{ name: 'John', age: 42 }, { name: 'Jane', age: 43 }, { name: 'Jack', age: 44 },];
        const string = (0, parser_1.html) `<ul>${users.map(user => list(user.name, user.age))}</ul>`;
        const string2 = (0, parser_1.html) `<ul>${users.map(user => list(user.name, user.age + 1))}</ul>`;
        expect(string.differentiate(string2)).toEqual({
            0: {
                0: {
                    1: 43
                }, 1: {
                    1: 44
                }, 2: {
                    1: 45
                }
            }
        });
    });
    it('should thor an error if an undefined value is passed to the html function', () => {
        const message = 'Hello World';
        const string = (0, parser_1.html) `<div class="${undefined}">${message}</div>`;
        expect(() => string.getParts()).toThrow();
    });
    it('should parse a html string with array dynamic values  to plain string', () => {
        const className = 'test';
        const users = [{ name: 'John', age: 42 }, { name: 'Jane', age: 43 }, { name: 'Jack', age: 44 },];
        const string = (0, parser_1.html) `<div class="${className}">${users.map(user => (0, parser_1.html) `<li>${user.name} is ${user.age} years old</li>`)}</div>`;
        expect(string.toString()).toEqual('<div class="test"><li>John is 42 years old</li><li>Jane is 43 years old</li><li>Jack is 44 years old</li></div>');
    });
});
describe('CssGenerator', () => {
    it('should generate a record object from a string', () => {
        const css = (0, cssGenerator_1.CssGenerator)('hello');
        const data = css `.body { color: red; }`;
        expect(data.classes).toEqual({ body: 'body-hello' });
    });
    it('should generate a record object from a string with multiple classes', () => {
        const css = (0, cssGenerator_1.CssGenerator)('hello');
        const data = css `.body { color: red; } .test { color: blue; }`;
        expect(data.classes).toEqual({ body: 'body-hello', test: 'test-hello' });
    });
    it('should generate a record object from a string with multiple classes and multiple rules', () => {
        const css = (0, cssGenerator_1.CssGenerator)('hello');
        const data = css `.body { color: red; } .test { color: blue; } .test2 { color: green; }`;
        expect(data.classes).toEqual({ body: 'body-hello', test: 'test-hello', test2: 'test2-hello' });
    });
    it('should generate a style element from a string', () => {
        const css = (0, cssGenerator_1.CssGenerator)('hello');
        const data = css `.body { color: red; }`;
        expect(data.string.toString()).toEqual('<style>.body-hello { color: red; }</style>');
    });
    it('should generate a style element from a string with multiple classes', () => {
        const css = (0, cssGenerator_1.CssGenerator)('hello');
        const data = css `.body { color: red; } .test { color: blue; }`;
        expect(data.string.toString()).toEqual('<style>.body-hello { color: red; } .test-hello { color: blue; }</style>');
    });
    it('should generate a style element from a string with multiple classes and multiple rules', () => {
        const css = (0, cssGenerator_1.CssGenerator)('hello');
        const data = css `.body { color: red; } .test { color: blue; } .test2 { color: green; }`;
        expect(data.string.toString()).toEqual('<style>.body-hello { color: red; } .test-hello { color: blue; } .test2-hello { color: green; }</style>');
    });
});
