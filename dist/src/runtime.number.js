"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const runtime_value_1 = __importDefault(require("./runtime.value"));
class RuntimeNumber extends runtime_value_1.default {
    value;
    constructor(value) {
        super();
        this.value = value;
    }
}
exports.default = RuntimeNumber;
