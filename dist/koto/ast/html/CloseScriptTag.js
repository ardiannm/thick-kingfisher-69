"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CloseTag_1 = __importDefault(require("./CloseTag"));
class CloseScriptTag extends CloseTag_1.default {
    constructor() {
        super("script");
    }
}
exports.default = CloseScriptTag;
