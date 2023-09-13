"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const System_1 = __importDefault(require("./System"));
class SystemSpreadsheetRange extends System_1.default {
    row;
    column;
    constructor(row, column) {
        super();
        this.row = row;
        this.column = column;
    }
}
exports.default = SystemSpreadsheetRange;
