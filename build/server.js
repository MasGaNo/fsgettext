"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var staticserver_1 = __importDefault(require("staticserver"));
staticserver_1.default.useStatic(__dirname + "/../dist").listen(8900, function () {
    console.log("Listen to 8900", __dirname);
});
