"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pubSub_1 = require("./pubSub");
describe('Broadcast', function () {
    it('should be defined', function () {
        expect(pubSub_1.Broadcast).toBeDefined();
    });
    it('should be a class', function () {
        expect(pubSub_1.Broadcast).toBeInstanceOf(Function);
    });
    it('should have a method called publish', function () {
        expect(new pubSub_1.Broadcast().publish).toBeDefined();
    });
    it('should have a method called subscribe', function () {
        expect(new pubSub_1.Broadcast().subscribe).toBeDefined();
    });
    // Functionality tests
    it('should publish a message to all subscribers', function () {
        var broadcast = new pubSub_1.Broadcast();
        var subscriber = jest.fn();
        broadcast.subscribe(subscriber); // test with one subscriber
        broadcast.publish('Hello');
        expect(subscriber).toHaveBeenCalledWith('Hello');
    });
    it('should publish a message to all subscribers', function () {
        var broadcast = new pubSub_1.Broadcast();
        var subscriber1 = jest.fn();
        var subscriber2 = jest.fn();
        broadcast.subscribe(subscriber1); // test with two subscribers
        broadcast.subscribe(subscriber2);
        broadcast.publish('Hello');
        expect(subscriber1).toHaveBeenCalledWith('Hello');
        expect(subscriber2).toHaveBeenCalledWith('Hello');
    });
    it('should publish a message to all subscribers', function () {
        // including subscribers that subscribe after the first message is published
        var broadcast = new pubSub_1.Broadcast();
        var subscriber1 = jest.fn();
        var subscriber2 = jest.fn();
        broadcast.subscribe(subscriber1);
        broadcast.publish('Hello');
        broadcast.subscribe(subscriber2);
        broadcast.publish('Hello Again');
        expect(subscriber1).toHaveBeenCalledWith('Hello');
        expect(subscriber1).toHaveBeenCalledWith('Hello Again');
        expect(subscriber2).toHaveBeenCalledWith('Hello Again');
    });
    it('should unsubscribe a subscriber and thus not receive new messagea', function () {
        var broadcast = new pubSub_1.Broadcast();
        var subscriber1 = jest.fn();
        var subscriber2 = jest.fn();
        broadcast.subscribe(subscriber1);
        broadcast.subscribe(subscriber2);
        broadcast.publish('Hello');
        var subscription = broadcast.subscribe(subscriber2);
        subscription.unsubscribe();
        broadcast.publish('Hello Again');
        expect(subscriber1).toHaveBeenCalledWith('Hello');
        expect(subscriber1).toHaveBeenCalledWith('Hello Again');
        expect(subscriber2).toHaveBeenCalledWith('Hello');
        expect(subscriber2).not.toHaveBeenCalledWith('Hello Again');
    });
    it('should stop the broadcast midway if a subscription returns a value', function () {
        var broadcast = new pubSub_1.Broadcast();
        var subscriber1 = jest.fn();
        var subscriber2 = jest.fn(function () { return true; });
        var subscriber3 = jest.fn();
        broadcast.subscribe(subscriber1);
        broadcast.subscribe(subscriber2);
        broadcast.subscribe(subscriber3);
        broadcast.publish('Hello');
        expect(subscriber1).toHaveBeenCalledWith('Hello');
        expect(subscriber2).toHaveBeenCalledWith('Hello');
        expect(subscriber3).not.toHaveBeenCalled();
    });
});
