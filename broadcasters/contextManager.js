"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    subscribe(componentId, component) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const liveSocket = {};
            const router = {};
            const verify = {
                contextId: this._contextId,
                data: this._initialValue,
                listensFor: []
            };
            yield ((_a = component.onContextChange) === null || _a === void 0 ? void 0 : _a.call({}, verify, liveSocket, router));
            if (verify.listensFor.some(id => id === this._contextId))
                this._managers.add(componentId);
            return this._managers.has(componentId);
        });
    }
    mountSocket(socket) {
        const doc = this._database.getOrCreate(socket.clientId, () => new base_1.Subject(this._initialValue));
        const sub = doc.doc.subscribe(data => {
            const peakData = {
                contextId: this._contextId,
                data: Object.freeze(Object.assign({}, data))
            };
            void socket.onContextChange(peakData);
        });
        return this._generateUnSubscribe(socket, sub);
    }
    assign(socket, assigns) {
        const doc = this._database.get(socket.clientId);
        if (doc) {
            const newDoc = Object.assign(Object.assign({}, doc.doc.value), assigns);
            doc.doc.publish(newDoc);
        }
    }
    get(socket) {
        const doc = this._database.get(socket.clientId);
        if (doc)
            return Object.freeze(Object.assign({}, doc.doc.value));
        return Object.freeze(Object.assign({}, this._initialValue));
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
                if (doc && doc.doc.observers.size === 0)
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
            getContext: contextManager.get.bind(contextManager),
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
