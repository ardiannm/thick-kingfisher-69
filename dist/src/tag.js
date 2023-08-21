"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const html_1 = __importDefault(require("./html"));
class Tag extends html_1.default {
    id;
    identifier;
    constructor(id, identifier) {
        super(id);
        this.id = id;
        this.identifier = identifier;
    }
}
exports.default = Tag;
