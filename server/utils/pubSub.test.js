"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pubSub_1 = require("./pubSub");
describe('Broadcast', () => {
    it('should be defined', () => {
        expect(pubSub_1.Broadcast).toBeDefined();
    });
    it('should be a class', () => {
        expect(pubSub_1.Broadcast).toBeInstanceOf(Function);
    });
    it('should have a method called publish', () => {
        expect(new pubSub_1.Broadcast().publish).toBeDefined();
    });
    it('should have a method called subscribe', () => {
        expect(new pubSub_1.Broadcast().subscribe).toBeDefined();
    });
    // Functionality tests
    it('should publish a message to all subscribers', () => {
        const broadcast = new pubSub_1.Broadcast();
        const subscriber = jest.fn();
        broadcast.subscribe(subscriber); // test with one subscriber
        broadcast.publish('Hello');
        expect(subscriber).toHaveBeenCalledWith('Hello');
    });
    it('should publish a message to all subscribers', () => {
        const broadcast = new pubSub_1.Broadcast();
        const subscriber1 = jest.fn();
        const subscriber2 = jest.fn();
        broadcast.subscribe(subscriber1); // test with two subscribers
        broadcast.subscribe(subscriber2);
        broadcast.publish('Hello');
        expect(subscriber1).toHaveBeenCalledWith('Hello');
        expect(subscriber2).toHaveBeenCalledWith('Hello');
    });
    it('should publish a message to all subscribers', () => {
        // including subscribers that subscribe after the first message is published
        const broadcast = new pubSub_1.Broadcast();
        const subscriber1 = jest.fn();
        const subscriber2 = jest.fn();
        broadcast.subscribe(subscriber1);
        broadcast.publish('Hello');
        broadcast.subscribe(subscriber2);
        broadcast.publish('Hello Again');
        expect(subscriber1).toHaveBeenCalledWith('Hello');
        expect(subscriber1).toHaveBeenCalledWith('Hello Again');
        expect(subscriber2).toHaveBeenCalledWith('Hello Again');
    });
    it('should unsubscribe a subscriber and thus not receive new messagea', () => {
        const broadcast = new pubSub_1.Broadcast();
        const subscriber1 = jest.fn();
        const subscriber2 = jest.fn();
        broadcast.subscribe(subscriber1);
        broadcast.subscribe(subscriber2);
        broadcast.publish('Hello');
        const subscription = broadcast.subscribe(subscriber2);
        subscription.unsubscribe();
        broadcast.publish('Hello Again');
        expect(subscriber1).toHaveBeenCalledWith('Hello');
        expect(subscriber1).toHaveBeenCalledWith('Hello Again');
        expect(subscriber2).toHaveBeenCalledWith('Hello');
        expect(subscriber2).not.toHaveBeenCalledWith('Hello Again');
    });
    it('should stop the broadcast midway if a subscription returns a value', () => {
        const broadcast = new pubSub_1.Broadcast();
        const subscriber1 = jest.fn();
        const subscriber2 = jest.fn(() => true);
        const subscriber3 = jest.fn();
        broadcast.subscribe(subscriber1);
        broadcast.subscribe(subscriber2);
        broadcast.subscribe(subscriber3);
        broadcast.publish('Hello');
        expect(subscriber1).toHaveBeenCalledWith('Hello');
        expect(subscriber2).toHaveBeenCalledWith('Hello');
        expect(subscriber3).not.toHaveBeenCalled();
    });
});
describe('Subject', () => {
    it('should be defined', () => {
        expect(pubSub_1.Subject).toBeDefined();
    });
    it('should be a class', () => {
        expect(pubSub_1.Subject).toBeInstanceOf(Function);
    });
    it('should have a method called next', () => {
        expect(new pubSub_1.Subject('hello').publish).toBeDefined();
    });
    it('should have a method called subscribe', () => {
        expect(new pubSub_1.Subject('hello').subscribe).toBeDefined();
    });
    // Functionality tests
    it('should publish a message to all subscribers', () => {
        const subject = new pubSub_1.Subject('hi');
        const subscriber = jest.fn();
        subject.subscribe(subscriber); // test with one subscriber
        subject.publish('Hello');
        expect(subscriber).toHaveBeenCalledWith('Hello');
    });
    it('should publish a message to all subscribers', () => {
        const subject = new pubSub_1.Subject('hi');
        const subscriber1 = jest.fn();
        const subscriber2 = jest.fn();
        subject.subscribe(subscriber1); // test with two subscribers
        subject.subscribe(subscriber2);
        subject.publish('Hello');
        expect(subscriber1).toHaveBeenCalledWith('Hello');
        expect(subscriber2).toHaveBeenCalledWith('Hello');
    });
    it('should prvoide the initial value to new subscribers', () => {
        const subject = new pubSub_1.Subject('hi');
        const subscriber = jest.fn();
        subject.subscribe(subscriber); // test with one subscriber
        expect(subscriber).toHaveBeenCalledWith('hi');
    });
    it('should publish a message to all subscribers', () => {
        // including subscribers that subscribe after the first message is published
        const subject = new pubSub_1.Subject('hi');
        const subscriber1 = jest.fn();
        const subscriber2 = jest.fn();
        subject.subscribe(subscriber1);
        subject.publish('Hello');
        subject.subscribe(subscriber2);
        subject.publish('Hello Again');
        expect(subscriber1).toHaveBeenCalledWith('Hello');
        expect(subscriber1).toHaveBeenCalledWith('Hello Again');
        expect(subscriber2).toHaveBeenCalledWith('Hello Again');
    });
    it('should return the current value when the getter is called', () => {
        const subject = new pubSub_1.Subject('hi');
        expect(subject.value).toEqual('hi');
    });
});
