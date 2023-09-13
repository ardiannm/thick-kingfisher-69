"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HTML_1 = __importDefault(require("./HTML"));
class Attribute extends HTML_1.default {
    property;
    value;
    constructor(property, value) {
        super();
        this.property = property;
        this.value = value;
    }
}
exports.default = Attribute;
