"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = __importDefault(require("./Expression"));
class Parenthesis extends Expression_1.default {
    expression;
    constructor(expression) {
        super();
        this.expression = expression;
    }
}
exports.default = Parenthesis;
