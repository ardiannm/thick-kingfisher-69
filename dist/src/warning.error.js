"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parser_error_1 = __importDefault(require("./parser.error"));
class WarningError extends parser_error_1.default {
}
exports.default = WarningError;
