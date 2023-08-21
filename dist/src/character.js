"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = __importDefault(require("./token"));
class Character extends token_1.default {
    id;
    view;
    constructor(id, view) {
        super(id);
        this.id = id;
        this.view = view;
    }
}
exports.default = Character;
