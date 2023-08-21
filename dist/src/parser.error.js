"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const log_error_1 = __importDefault(require("./log.error"));
class ParserError extends log_error_1.default {
    message;
    position;
    constructor(message, position) {
        super(message);
        this.message = message;
        this.position = position;
    }
}
exports.default = ParserError;
