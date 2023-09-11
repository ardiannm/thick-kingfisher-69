"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Lexer_1 = __importDefault(require("../Lexer"));
var ColorCode;
(function (ColorCode) {
    ColorCode["Red"] = "\u001B[31m";
    ColorCode["Blue"] = "\u001B[38;2;86;156;214m";
    ColorCode["White"] = "\u001B[0m";
    ColorCode["Green"] = "\u001B[38;2;78;201;176m";
    ColorCode["Orange"] = "\u001B[38;2;215;186;125m";
    ColorCode["Brown"] = "\u001B[38;2;206;145;120m";
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
    trackPosition() {
        this.storeLine = this.line;
        this.storeColumn = this.column;
    }
    untrackPosition() {
        this.storeLine = undefined;
        this.storeColumn = undefined;
    }
    report(msg) {
        const input = this.input.split("\n");
        const line = this.storeLine || this.line;
        const column = this.storeColumn || this.column;
        const report = new Array();
        report.push("");
        report.push("");
        report.push(this.colorize(`message: ${msg}`, ColorCode.Orange));
        report.push(this.displayLine(input, line, column));
        report.push("");
        this.storeColumn = undefined;
        return report.join("\n");
    }
    displayLine(input, line, column) {
        let target = input[line - 1];
        let textContent1 = "";
        if (column > 70)
            textContent1 += target.substring(column - 1 - 70, column - 1);
        else
            textContent1 += target.substring(0, column - 1);
        let textContent2 = textContent1 + target.substring(column - 1, column - 1 + 30);
        const lineNumber = ` -- ${line} -- `;
        const adjustSpace = " ".repeat(textContent1.length + lineNumber.length + 1);
        textContent2 += "\n" + adjustSpace + this.colorize(`\`--- ${this.path}:${line}:${column}`, ColorCode.Orange);
        return this.colorize(lineNumber + textContent2, ColorCode.Blue);
    }
    colorize(text, startColor, endColor = ColorCode.White) {
        return `${startColor}${text} ${endColor}`;
    }
}
exports.default = ParserService;
