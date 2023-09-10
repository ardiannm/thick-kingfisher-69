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
        report.push(`error: ${msg}`);
        report.push(` -- ${this.path}:${n}:${m}`);
        report.push("");
        if (input[n - 3] !== undefined)
            report.push(`  ${this.formatNumber(n - 2, n + 2)}   ${input[n - 3]}`);
        if (input[n - 2] !== undefined)
            report.push(`  ${this.formatNumber(n - 1, n + 2)}   ${input[n - 2]}`);
        const line = `${this.colorize("-", ColorCode.redColor, ColorCode.blueColor)} ${this.formatNumber(n + 0, n + 2)}   ${input[n - 1]}`;
        if (input[n - 1] !== undefined)
            report.push(this.colorize(line));
        const cursor = `  ${this.formatNumber(n + 0, n + 2).replace(/.+/g, " ")}   ${" ".repeat(m - 1)}${this.colorize("^", ColorCode.redColor)}`;
        if (input[n - 1] !== undefined)
            report.push(this.colorize(cursor));
        if (input[n - 0] !== undefined)
            report.push(`  ${this.formatNumber(n + 1, n + 2)}   ${input[n - 0]}`);
        if (input[n + 1] !== undefined)
            report.push(`  ${this.formatNumber(n + 2, n + 2)}   ${input[n + 1]}`);
        report.push("");
        this.storeColumn = undefined;
        return report.join("\n");
    }
    formatNumber(num, offset) {
        const numString = num.toString();
        return " ".repeat(offset.toString().length - numString.length) + numString;
    }
    colorize(text, startColor = ColorCode.blueColor, endColor = ColorCode.resetColor) {
        return `${startColor}${text}${endColor}`;
    }
    markPosition() {
        this.storeLine = this.line;
        this.storeColumn = this.column;
    }
    unmarkPosition() {
        this.storeLine = undefined;
        this.storeColumn = undefined;
    }
}
exports.default = ParserService;
