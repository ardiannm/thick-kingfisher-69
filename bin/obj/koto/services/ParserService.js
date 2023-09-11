"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Lexer_1 = __importDefault(require("../Lexer"));
var ColorCode;
(function (ColorCode) {
    ColorCode["redColor"] = "\u001B[31m";
    ColorCode["greenColor"] = "\u001B[32m";
    ColorCode["blueColor"] = "\u001B[34m";
    ColorCode["resetColor"] = "\u001B[0m";
})(ColorCode || (ColorCode = {}));
class ParserService extends Lexer_1.default {
    input;
    path;
    storeLine;
    storeColumn;
    constructor(input, path) {
        super(input);
        this.input = input;
        this.path = path;
    }
    assert(instance, tokenType) {
        return instance instanceof tokenType;
    }
    expect(token, tokenType, message) {
        if (this.assert(token, tokenType))
            return token;
        throw this.report(message);
    }
    doNotExpect(token, tokenType, message) {
        if (this.assert(token, tokenType)) {
            throw this.report(message);
        }
        return token;
    }
    throwError(message) {
        throw this.report(message);
    }
    report(msg) {
        const input = this.input.split("\n");
        const n = this.storeLine || this.line;
        const m = this.storeColumn || this.column;
        const report = new Array();
        report.push("");
        report.push("");
        report.push(this.displayLine(input, n, m));
        report.push("");
        report.push(`error: ${msg}`);
        report.push(` -- ${this.path}:${n}:${m}`);
        report.push("");
        this.storeColumn = undefined;
        return report.join("\n");
    }
    formatNumber(num, offset) {
        const numString = num.toString();
        return " ".repeat(offset.toString().length - numString.length) + numString;
    }
    colorize(text, startColor = ColorCode.blueColor, endColor = ColorCode.resetColor) {
        return `${startColor}${text} ${endColor}`;
    }
    markPosition() {
        this.storeLine = this.line;
        this.storeColumn = this.column;
    }
    unmarkPosition() {
        this.storeLine = undefined;
        this.storeColumn = undefined;
    }
    writePath() {
        return `${this.path}:${this.line}:${this.column}`;
    }
    displayLine(input, n, m) {
        const line = n - 1;
        const column = m - 1;
        let target = input[line];
        let part1 = "";
        if (m > 100)
            part1 = this.colorize("// ", ColorCode.redColor, ColorCode.blueColor) + target.substring(column - 100, column);
        else
            part1 = target.substring(0, column);
        const lineNumber = `${this.formatNumber(line + 1, line + 3)}   `;
        let format = lineNumber + part1 + this.colorize("//", ColorCode.redColor, ColorCode.blueColor) + target.substring(column, column + 20);
        return this.colorize(format);
    }
}
exports.default = ParserService;
