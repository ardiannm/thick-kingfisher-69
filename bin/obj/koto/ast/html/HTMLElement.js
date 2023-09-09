"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HTMLComponent_1 = __importDefault(require("./HTMLComponent"));
class HTMLElement extends HTMLComponent_1.default {
    tag;
    children;
    constructor(tag, children) {
        super();
        this.tag = tag;
        this.children = children;
    }
}
exports.default = HTMLElement;
