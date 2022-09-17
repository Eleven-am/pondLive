"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PondSenders = exports.PondBaseActions = exports.MessageTypes = exports.ClientActions = exports.ServerActions = exports.ResponsePicker = void 0;
var ResponsePicker;
(function (ResponsePicker) {
    ResponsePicker["POND"] = "POND";
    ResponsePicker["CHANNEL"] = "CHANNEL";
})(ResponsePicker = exports.ResponsePicker || (exports.ResponsePicker = {}));
var ServerActions;
(function (ServerActions) {
    ServerActions["ERROR"] = "ERROR";
    ServerActions["MESSAGE"] = "MESSAGE";
    ServerActions["PRESENCE"] = "PRESENCE";
    ServerActions["CLOSE"] = "CLOSE";
})(ServerActions = exports.ServerActions || (exports.ServerActions = {}));
var ClientActions;
(function (ClientActions) {
    ClientActions["JOIN_CHANNEL"] = "JOIN_CHANNEL";
    ClientActions["LEAVE_CHANNEL"] = "LEAVE_CHANNEL";
    ClientActions["UPDATE_PRESENCE"] = "UPDATE_PRESENCE";
    ClientActions["BROADCAST_FROM"] = "BROADCAST_FROM";
    ClientActions["BROADCAST"] = "BROADCAST";
    ClientActions["SEND_MESSAGE_TO_USER"] = "SEND_MESSAGE_TO_USER";
})(ClientActions = exports.ClientActions || (exports.ClientActions = {}));
var MessageTypes;
(function (MessageTypes) {
    MessageTypes["BROADCAST"] = "BROADCAST";
    MessageTypes["BROADCAST_FROM"] = "BROADCAST_FROM";
    MessageTypes["SEND_MESSAGE_TO_USER"] = "SEND_MESSAGE_TO_USER";
})(MessageTypes = exports.MessageTypes || (exports.MessageTypes = {}));
var PondBaseActions;
(function (PondBaseActions) {
    PondBaseActions["ADD_TO_POND"] = "ADD_TO_POND";
    PondBaseActions["REMOVE_FROM_POND"] = "REMOVE_FROM_POND";
    PondBaseActions["UPDATE_IN_POND"] = "UPDATE_IN_POND";
})(PondBaseActions = exports.PondBaseActions || (exports.PondBaseActions = {}));
var PondSenders;
(function (PondSenders) {
    PondSenders["SERVER"] = "SERVER";
    PondSenders["ENDPOINT"] = "ENDPOINT";
    PondSenders["POND_CHANNEL"] = "POND_CHANNEL";
})(PondSenders = exports.PondSenders || (exports.PondSenders = {}));
