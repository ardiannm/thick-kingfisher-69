"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expression_1 = __importDefault(require("./expression"));
class Program extends expression_1.default {
    id;
    expressions;
    constructor(id, expressions) {
        super(id);
        this.id = id;
        this.expressions = expressions;
    }
}
exports.default = Program;
