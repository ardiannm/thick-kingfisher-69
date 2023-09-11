"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HTMLComponent_1 = __importDefault(require("./HTMLComponent"));
class HTMLElement extends HTMLComponent_1.default {
    tag;
    attributes;
    children;
    constructor(tag, attributes, children) {
        super();
        this.tag = tag;
        this.attributes = attributes;
        this.children = children;
    }
}
exports.default = HTMLElement;
