"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const html_1 = __importDefault(require("./html"));
class Property extends html_1.default {
    id;
    identifier;
    value;
    constructor(id, identifier, value) {
        super(id);
        this.id = id;
        this.identifier = identifier;
        this.value = value;
    }
}
exports.default = Property;
