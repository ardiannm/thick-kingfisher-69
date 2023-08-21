"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tag_1 = __importDefault(require("./tag"));
class OpenTag extends tag_1.default {
    id;
    identifier;
    properties;
    constructor(id, identifier, properties) {
        super(id, identifier);
        this.id = id;
        this.identifier = identifier;
        this.properties = properties;
    }
}
exports.default = OpenTag;
