"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expression_1 = __importDefault(require("./expression"));
class Unary extends expression_1.default {
    id;
    operator;
    right;
    constructor(id, operator, right) {
        super(id);
        this.id = id;
        this.operator = operator;
        this.right = right;
    }
}
exports.default = Unary;
