"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondBase = exports.PondDocument = void 0;
const pubSub_1 = require("./pubSub");
const enums_1 = require("../enums");
const basePromise_1 = require("./basePromise");
class PondDocument {
    _id;
    _doc;
    _removeDoc;
    _updateDoc;
    constructor(id, doc, removeDoc, updateDoc) {
        this._id = id;
        this._doc = doc;
        this._removeDoc = removeDoc;
        this._updateDoc = updateDoc;
    }
    get id() {
        return this._id;
    }
    get doc() {
        return this._doc;
    }
    /**
     * @desc Removes the document from the collection
     */
    removeDoc() {
        this._removeDoc();
        return this._doc;
    }
    /**
     * @desc Updates the document in the collection
     * @param value - the new value of the document
     */
    updateDoc(value) {
        this._doc = this._updateDoc(value).doc;
    }
}
exports.PondDocument = PondDocument;
class PondBase {
    _db;
    _broadcast;
    constructor() {
        this._db = {};
        this._broadcast = new pubSub_1.Broadcast();
    }
    /**
     * @desc Get the number of documents
     */
    get size() {
        return Object.keys(this._db).length;
    }
    /**
     * @desc Get a document by key
     * @param key - The key of the document
     */
    get(key) {
        const doc = this._db[key];
        if (doc)
            return this._createPondDocument(key, doc);
        return null;
    }
    /**
     * @desc Set a document to the database
     * @param value - The value of the document
     */
    set(value) {
        const key = this._nanoid();
        this._db[key] = value;
        this._broadcast.publish({ oldValue: null, currentValue: value });
        return this._createPondDocument(key, value);
    }
    /**
     * @desc Update a document by key
     * @param key - The key of the document
     * @param value - The new value of the document
     */
    update(key, value) {
        if (this._db[key]) {
            this._db[key] = value;
            this._broadcast.publish({ oldValue: this._db[key], currentValue: value });
            return this._createPondDocument(key, value);
        }
        else
            throw new basePromise_1.PondError(`Key ${key} does not exist in the pond`, 404, key);
    }
    /**
     * @desc Create a pond document
     * @param creator - The creator function of the pond document
     */
    createDocument(creator) {
        let scaffold = this._createPondDocument(this._nanoid(), undefined);
        const doc = creator(scaffold);
        this._db[scaffold.id] = doc;
        scaffold.updateDoc(doc);
        this._broadcast.publish({ oldValue: null, currentValue: doc });
        return scaffold;
    }
    /**
     * @desc Merge the pond with another pond
     * @param pond - The pond to merge with
     */
    merge(pond) {
        for (const key in pond._db) {
            this._db[key] = pond._db[key];
        }
        return this;
    }
    /**
     * @desc Generate a generator of all documents
     */
    *generate() {
        for (const key in this._db) {
            yield this._db[key];
        }
    }
    /**
     * @desc Query documents by a query function
     * @param query - The query function
     */
    query(query) {
        const result = [];
        for (const key in this._db) {
            const doc = this._db[key];
            if (query(doc))
                result.push(this._createPondDocument(key, doc));
        }
        return result;
    }
    /**
     * @desc Query documents by a query function on the document's key
     * @param query - The query function
     */
    queryById(query) {
        const result = [];
        for (const key in this._db) {
            if (query(key))
                result.push(this._createPondDocument(key, this._db[key]));
        }
        return result;
    }
    /**
     * @desc Query documents by a list of keys
     * @param keys - The keys of the documents
     */
    queryByKeys(keys) {
        return keys.map(key => this.get(key)).filter(doc => doc !== null);
    }
    /**
     * @desc Reduces the pond to a single value
     * @param reducer - The reducer function
     * @param initialValue - The initial value of the reducer
     */
    reduce(reducer, initialValue) {
        let index = 0;
        for (const key in this._db) {
            initialValue = reducer(initialValue, this._db[key], index);
            index++;
        }
        return initialValue;
    }
    /**
     * @desc Find a document by a query function
     * @param query - The query function
     */
    find(query) {
        for (const key in this._db) {
            const doc = this._db[key];
            if (query(doc))
                return this._createPondDocument(key, doc);
        }
        return null;
    }
    /**
     * @desc Map the pond to a new array
     * @param mapper - The mapper function
     */
    map(mapper) {
        return Object.values(this._db).map(mapper);
    }
    /**
     * @desc Clear the pond
     */
    clear() {
        const keys = Object.keys(this._db);
        keys.forEach(key => this._delete(key));
    }
    /**
     * @desc Subscribe to change on all documents
     * @param handler - The handler function of the event
     */
    subscribe(handler) {
        return this._broadcast.subscribe((data) => {
            let change = enums_1.PondBaseActions.UPDATE_IN_POND;
            if (data.oldValue === null)
                change = enums_1.PondBaseActions.ADD_TO_POND;
            else if (data.currentValue === null)
                change = enums_1.PondBaseActions.REMOVE_FROM_POND;
            handler(Object.values(this._db), data.currentValue, change);
        });
    }
    /**
     * @desc Get all the documents in an array
     */
    toArray() {
        const result = [];
        for (const key in this._db) {
            const doc = this._db[key];
            result.push(this._createPondDocument(key, doc));
        }
        return result;
    }
    /**
     * @desc Delete a document by key
     */
    _delete(key) {
        delete this._db[key];
        this._broadcast.publish({ oldValue: this._db[key], currentValue: null });
    }
    /**
     * @des Generate a key for a new document
     */
    _nanoid = () => {
        let id = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 21; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };
    /**
     * @desc Create a pond document
     * @param id - The id of the document
     * @param doc - The document
     * @private
     */
    _createPondDocument(id, doc) {
        const removeDoc = this._delete.bind(this, id);
        const updateDoc = this.update.bind(this, id);
        return new PondDocument(id, doc, removeDoc, updateDoc);
    }
}
exports.PondBase = PondBase;
