"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = __importDefault(require("./Expression"));
class Import extends Expression_1.default {
    path;
    module;
    constructor(path, module) {
        super();
        this.path = path;
        this.module = module;
    }
}
exports.default = Import;
