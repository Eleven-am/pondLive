"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = exports.ContextManager = void 0;
var pondbase_1 = require("../pondbase");
var ContextManager = /** @class */ (function () {
    function ContextManager(name, initialData) {
        this._name = name;
        this._database = new pondbase_1.PondBase();
        this._managers = new Set();
        this._initialValue = initialData;
    }
    ContextManager.prototype.subscribe = function (manager) {
        this._managers.add(manager);
    };
    ContextManager.prototype.assign = function (socket, assigns) {
        var _this = this;
        var db = this._database.find(function (doc) { return doc.clientId === socket.clientId; });
        var newDoc;
        if (db) {
            newDoc = Object.assign(db.doc.data, assigns);
            db.updateDoc({ clientId: db.doc.clientId, data: newDoc });
        }
        else {
            newDoc = Object.assign(this._initialValue, assigns);
            this._database.set({ clientId: socket.clientId, data: newDoc });
        }
        this._managers.forEach(function (manager) { return manager.handleContextChange(newDoc, _this._name, socket.clientId); });
    };
    ContextManager.prototype.get = function (socket) {
        var db = this._database.find(function (doc) { return doc.clientId === socket.clientId; });
        if (db) {
            var data = __assign({}, db.doc.data);
            return Object.freeze(data);
        }
        var unfrozen = __assign({}, this._initialValue);
        return Object.freeze(unfrozen);
    };
    ContextManager.prototype.deleteClient = function (socket) {
        var doc = this._database.find(function (doc) { return doc.clientId === socket.clientId; });
        if (doc)
            doc.removeDoc();
    };
    ContextManager.prototype.getData = function (socket) {
        var db = this._database.find(function (doc) { return doc.clientId === socket.clientId; });
        if (db) {
            var data = __assign({}, db.doc.data);
            return { name: this._name, data: Object.freeze(data) };
        }
        var unfrozen = __assign({}, this._initialValue);
        return { name: this._name, data: Object.freeze(unfrozen) };
    };
    return ContextManager;
}());
exports.ContextManager = ContextManager;
function createContext(contextId, initialValue) {
    var contextManager = new ContextManager(contextId, initialValue);
    return [
        {
            assign: contextManager.assign.bind(contextManager),
            get: contextManager.get.bind(contextManager)
        },
        {
            subscribe: contextManager.subscribe.bind(contextManager),
            deleteClient: contextManager.deleteClient.bind(contextManager),
            getData: contextManager.getData.bind(contextManager)
        }
    ];
}
exports.createContext = createContext;
