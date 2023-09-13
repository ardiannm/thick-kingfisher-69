"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = __importDefault(require("./Expression"));
class Interpolation extends Expression_1.default {
    strings;
    constructor(strings) {
        super();
        this.strings = strings;
    }
}
exports.default = Interpolation;
