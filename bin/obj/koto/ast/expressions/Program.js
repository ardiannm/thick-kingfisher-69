"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = __importDefault(require("./Expression"));
class Program extends Expression_1.default {
    expressions;
    constructor(expressions) {
        super();
        this.expressions = expressions;
    }
}
exports.default = Program;
