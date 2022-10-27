"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = exports.ContextDistributor = void 0;
const base_1 = require("@eleven-am/pondsocket/base");
class ContextDistributor {
    constructor(initialValue) {
        this._initialValue = initialValue;
        this._managers = new Set();
        this._contextId = Math.random().toString(36).substring(2, 15);
        this._database = new base_1.SimpleBase();
    }
    async subscribe(componentId, component) {
        var _a;
        const liveSocket = {};
        const router = {};
        const verify = {
            contextId: this._contextId,
            data: this._initialValue,
            listensFor: []
        };
        await ((_a = component.onContextChange) === null || _a === void 0 ? void 0 : _a.call({}, verify, liveSocket, router));
        if (verify.listensFor.some(id => id === this._contextId))
            this._managers.add(componentId);
        return this._managers.has(componentId);
    }
    mountSocket(socket) {
        const doc = this._database.getOrCreate(socket.clientId, () => new base_1.Subject(this._initialValue));
        const sub = doc.doc.subscribe(data => {
            const peakData = {
                contextId: this._contextId,
                data: Object.freeze({ ...data })
            };
            socket.onContextChange(peakData);
        });
        return this._generateUnSubscribe(socket, sub);
    }
    assign(socket, assigns) {
        const doc = this._database.get(socket.clientId);
        if (doc) {
            const newDoc = Object.assign({ ...doc.doc.value }, assigns);
            doc.doc.publish(newDoc);
        }
    }
    get(socket) {
        const doc = this._database.get(socket.clientId);
        if (doc)
            return Object.freeze({ ...doc.doc.value });
        return Object.freeze({ ...this._initialValue });
    }
    pullContext(socket) {
        const data = this.get(socket);
        const peakData = {
            contextId: this._contextId,
            data: data
        };
        return peakData;
    }
    handleContextChange(context, handler) {
        if (context.listensFor)
            context.listensFor.push(this._contextId);
        else if (context.contextId === this._contextId)
            handler(context.data);
    }
    _generateUnSubscribe(socket, subscription) {
        return {
            unsubscribe: () => {
                subscription.unsubscribe();
                const doc = this._database.get(socket.clientId);
                if (doc && doc.doc.subscriberCount === 0)
                    doc.removeDoc();
            }
        };
    }
}
exports.ContextDistributor = ContextDistributor;
function createContext(initialData) {
    const contextManager = new ContextDistributor(initialData);
    return [
        {
            assign: contextManager.assign.bind(contextManager),
            get: contextManager.get.bind(contextManager),
            handleContextChange: contextManager.handleContextChange.bind(contextManager)
        },
        {
            subscribe: contextManager.subscribe.bind(contextManager),
            pullContext: contextManager.pullContext.bind(contextManager),
            mountSocket: contextManager.mountSocket.bind(contextManager)
        }
    ];
}
exports.createContext = createContext;
