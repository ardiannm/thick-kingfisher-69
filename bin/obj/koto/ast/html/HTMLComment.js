"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HTMLComponent_1 = __importDefault(require("./HTMLComponent"));
class HTMLComment extends HTMLComponent_1.default {
    view;
    constructor(view) {
        super();
        this.view = view;
    }
}
exports.default = HTMLComment;
