"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = __importDefault(require("../expressions/Expression"));
class SpreadsheetCell extends Expression_1.default {
    column;
    row;
    constructor(column, row) {
        super();
        this.column = column;
        this.row = row;
    }
}
exports.default = SpreadsheetCell;
