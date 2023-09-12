"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HTMLComponent_1 = __importDefault(require("./HTMLComponent"));
class VoidHTMLElement extends HTMLComponent_1.default {
    tag;
    attributes;
    constructor(tag, attributes) {
        super();
        this.tag = tag;
        this.attributes = attributes;
    }
}
exports.default = VoidHTMLElement;
