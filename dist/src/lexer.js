"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = __importDefault(require("./state"));
const open_parenthesis_1 = __importDefault(require("./open.parenthesis"));
const closing_parenthesis_1 = __importDefault(require("./closing.parenthesis"));
const number_1 = __importDefault(require("./number"));
const identifier_1 = __importDefault(require("./identifier"));
const unknown_character_1 = __importDefault(require("./unknown.character"));
const exponentiation_1 = __importDefault(require("./exponentiation"));
const exclamation_mark_1 = __importDefault(require("./exclamation.mark"));
const substraction_1 = __importDefault(require("./substraction"));
const division_1 = __importDefault(require("./division"));
const question_mark_1 = __importDefault(require("./question.mark"));
const quote_1 = __importDefault(require("./quote"));
const less_than_1 = __importDefault(require("./less.than"));
const addition_1 = __importDefault(require("./addition"));
const greater_than_1 = __importDefault(require("./greater.than"));
const equals_1 = __importDefault(require("./equals"));
const multiplication_1 = __importDefault(require("./multiplication"));
const space_1 = __importDefault(require("./space"));
const newline_1 = __importDefault(require("./newline"));
const eof_1 = __importDefault(require("./eof"));
class Lexer {
    input;
    pointer = 0;
    generation = 0;
    line = 1;
    space = false;
    data = new Map();
    constructor(input) {
        this.input = input;
    }
    getNextToken() {
        const char = this.peek();
        const data = this.keepState();
        const id = this.generate(data);
        if (/\r|\n/.test(char))
            return this.getNewLine();
        if (/\s/.test(char))
            return this.getSpace();
        if (/[a-zA-Z]/.test(char))
            return this.getIdentifier();
        if (/[0-9]/.test(char))
            return this.getNumber();
        const next = this.getNext();
        if (char == "(")
            return new open_parenthesis_1.default(id, next);
        if (char == ")")
            return new closing_parenthesis_1.default(id, next);
        if (char == "!")
            return new exclamation_mark_1.default(id, next);
        if (char == "?")
            return new question_mark_1.default(id, next);
        if (char == '"')
            return new quote_1.default(id, next);
        if (char == "<")
            return new less_than_1.default(id, next);
        if (char == ">")
            return new greater_than_1.default(id, next);
        if (char == "=")
            return new equals_1.default(id, next);
        if (char == "+")
            return new addition_1.default(id, next);
        if (char == "-")
            return new substraction_1.default(id, next);
        if (char == "*")
            return new multiplication_1.default(id, next);
        if (char == "/")
            return new division_1.default(id, next);
        if (char == "^")
            return new exponentiation_1.default(id, next);
        if (char)
            return new unknown_character_1.default(id, next);
        return new eof_1.default(id);
    }
    peekToken() {
        const data = this.keepState();
        const token = this.getNextToken();
        this.pointer = data.pointer;
        this.generation = data.id;
        if (this.line > data.line)
            this.line = data.line;
        return token;
    }
    getNumber() {
        let view = "";
        const data = this.keepState();
        while (/[0-9]/.test(this.peek()))
            view += this.getNext();
        const id = this.generate(data);
        return new number_1.default(id, view);
    }
    getNewLine() {
        let view = "";
        const data = this.keepState();
        while (/\r/.test(this.peek()))
            view += this.getNext();
        view += this.getNext();
        this.newLine();
        const id = this.generate(data);
        return new newline_1.default(id, view);
    }
    getSpace() {
        let view = "";
        const data = this.keepState();
        while (/\s/.test(this.peek()))
            view += this.getNext();
        const id = this.generate(data);
        if (this.space)
            return new space_1.default(id, view);
        return this.getNextToken();
    }
    getIdentifier() {
        let view = "";
        const data = this.keepState();
        while (/[a-zA-Z]/.test(this.peek()))
            view += this.getNext();
        const id = this.generate(data);
        return new identifier_1.default(id, view);
    }
    generate(data) {
        const id = this.generation + 1;
        this.generation = id;
        this.data.set(id, new state_1.default(data.pointer, this.pointer, data.line));
        return id;
    }
    hasMoreTokens() {
        return !(this.peekToken() instanceof eof_1.default);
    }
    keepSpace() {
        this.space = true;
    }
    ignoreSpace() {
        this.space = false;
    }
    peek() {
        return this.input.charAt(this.pointer);
    }
    getNext() {
        const character = this.peek();
        this.pointer = this.pointer + 1;
        return character;
    }
    newLine() {
        this.line = this.line + 1;
    }
    keepState() {
        return { id: this.generation, pointer: this.pointer, line: this.line };
    }
}
exports.default = Lexer;
