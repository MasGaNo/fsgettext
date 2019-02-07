"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logger;
(function (Logger) {
    var isEnable = true;
    function disable() {
        isEnable = false;
    }
    Logger.disable = disable;
    function enable() {
        isEnable = true;
    }
    Logger.enable = enable;
    function log() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        isEnable && console.log.apply(console, args);
    }
    Logger.log = log;
    function warn() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        isEnable && console.warn.apply(console, args);
    }
    Logger.warn = warn;
    function error() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        isEnable && console.error.apply(console, args);
    }
    Logger.error = error;
    function debug() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        isEnable && console.debug.apply(console, args);
    }
    Logger.debug = debug;
})(Logger = exports.Logger || (exports.Logger = {}));
exports.default = Logger;
