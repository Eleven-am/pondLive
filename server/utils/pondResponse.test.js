"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pondResponse_1 = require("./pondResponse");
describe('PondResponse', () => {
    it('should be defined', () => {
        expect(pondResponse_1.PondResponse).toBeDefined();
    });
    it('should call the resolver function on reject', (done) => {
        const resolver = jest.fn();
        const assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        const response = new pondResponse_1.PondResponse({}, assigns, resolver);
        response.reject();
        setTimeout(() => {
            expect(resolver).toBeCalled();
            done();
        }, 100);
    });
    it('should return an error object on reject', () => {
        const resolver = (data) => {
            expect(data.error).toBeDefined();
        };
        const assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        const response = new pondResponse_1.PondResponse({}, assigns, resolver);
        response.reject();
    });
    it('should return specified error object on reject', () => {
        const resolver = (data) => {
            expect(data.error?.errorMessage).toBe('test');
            expect(data.error?.errorCode).toBe(403);
        };
        const assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        const response = new pondResponse_1.PondResponse({}, assigns, resolver);
        response.reject('test');
    });
    it('should not return an error object when not rejected', () => {
        const resolver = (data) => {
            expect(data.error).toBeUndefined();
        };
        const assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        const response = new pondResponse_1.PondResponse({}, assigns, resolver);
        response.accept();
    });
    it('should return the specified assigns', () => {
        const resolver = (data) => {
            expect(data.assigns.assigns).toEqual({ test: 'test1' });
            expect(data.assigns.presence).toEqual({ test: 'test2' });
            expect(data.assigns.channelData).toEqual({ test: 'test3' });
        };
        const assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        const response = new pondResponse_1.PondResponse({}, assigns, resolver);
        response.accept({
            assigns: {
                test: 'test1'
            },
            presence: {
                test: 'test2'
            },
            channelData: {
                test: 'test3'
            }
        });
    });
    it('should return the specified assigns but with the message applied CHANNEL', () => {
        const resolver = async (data) => {
            expect(data.assigns.assigns).toEqual({ test: 'test1' });
            expect(data.assigns.presence).toEqual({ test: 'test2' });
            expect(data.assigns.channelData).toEqual({ test: 'test3' });
            expect(data.message).toEqual({ event: 'test', payload: { message: 'testMessage' } });
            expect(data.error).toBeUndefined();
        };
        const assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        const response = new pondResponse_1.PondResponse({}, assigns, resolver);
        response.send('test', { message: 'testMessage' }, {
            assigns: {
                test: 'test1'
            },
            presence: {
                test: 'test2'
            },
            channelData: {
                test: 'test3'
            }
        });
    });
    it('should return the specified assigns but with the message applied POND', () => {
        const secondResolver = async (data) => {
            expect(data.assigns.assigns).toEqual({ test: 'test1' });
            expect(data.message).toEqual({ event: 'test', payload: { message: 'testMessage' } });
            expect(data.error).toBeUndefined();
        };
        const assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        const response2 = new pondResponse_1.PondResponse({}, assigns, secondResolver);
        response2.send('test', { message: 'testMessage' }, {
            assigns: {
                test: 'test1'
            },
        });
    });
    it('should throw an error when you try to double send', () => {
        const resolver = (data) => {
            expect(data.assigns.assigns).toEqual({ test: 'test1' });
            expect(data.assigns.presence).toEqual({ test: 'test2' });
        };
        const assigns = {
            assigns: {},
            presence: {},
            channelData: {},
        };
        const response = new pondResponse_1.PondResponse({}, assigns, resolver);
        response.accept({
            assigns: {
                test: 'test1'
            },
            presence: {
                test: 'test2'
            },
            channelData: {
                test: 'test3'
            }
        });
        expect(() => {
            response.accept({
                assigns: {
                    test: 'test1'
                },
                presence: {
                    test: 'test2'
                },
                channelData: {
                    test: 'test3'
                }
            });
        }).toThrow();
    });
});
