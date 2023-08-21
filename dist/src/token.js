"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Token {
    id;
    token = this.constructor.name.replace(/[A-Z]/g, " $&").trim().replace(/ /, "-").toLowerCase();
    constructor(id) {
        this.id = id;
    }
}
exports.default = Token;
