"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Tag_1 = __importDefault(require("./Tag"));
class OpenTag extends Tag_1.default {
    tag;
    attributes;
    constructor(tag, attributes) {
        super();
        this.tag = tag;
        this.attributes = attributes;
    }
}
exports.default = OpenTag;
