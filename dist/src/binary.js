"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expression_1 = __importDefault(require("./expression"));
class Binary extends expression_1.default {
    id;
    left;
    operator;
    right;
    constructor(id, left, operator, right) {
        super(id);
        this.id = id;
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}
exports.default = Binary;
