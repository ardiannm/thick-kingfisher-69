"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CloseParenthesis_1 = __importDefault(require("./ast/tokens/CloseParenthesis"));
const Number_1 = __importDefault(require("./ast/expressions/Number"));
const Identifier_1 = __importDefault(require("./ast/expressions/Identifier"));
const Power_1 = __importDefault(require("./ast/operators/Power"));
const ExclamationMark_1 = __importDefault(require("./ast/tokens/ExclamationMark"));
const Minus_1 = __importDefault(require("./ast/operators/Minus"));
const Slash_1 = __importDefault(require("./ast/operators/Slash"));
const Quote_1 = __importDefault(require("./ast/tokens/Quote"));
const LessThan_1 = __importDefault(require("./ast/tokens/LessThan"));
const Plus_1 = __importDefault(require("./ast/operators/Plus"));
const Comma_1 = __importDefault(require("./ast/tokens/Comma"));
const GreaterThan_1 = __importDefault(require("./ast/tokens/GreaterThan"));
const Equals_1 = __importDefault(require("./ast/tokens/Equals"));
const Product_1 = __importDefault(require("./ast/operators/Product"));
const Space_1 = __importDefault(require("./ast/tokens/Space"));
const SemiColon_1 = __importDefault(require("./ast/tokens/SemiColon"));
const Colon_1 = __importDefault(require("./ast/tokens/Colon"));
const BadToken_1 = __importDefault(require("./ast/tokens/BadToken"));
const EOF_1 = __importDefault(require("./ast/tokens/EOF"));
const OpenParenthesis_1 = __importDefault(require("./ast/tokens/OpenParenthesis"));
const BackSlash_1 = __importDefault(require("./ast/tokens/BackSlash"));
const OpenBrace_1 = __importDefault(require("./ast/tokens/OpenBrace"));
const CloseBrace_1 = __importDefault(require("./ast/tokens/CloseBrace"));
const Dot_1 = __importDefault(require("./ast/tokens/Dot"));
class Lexer {
    input;
    pointer = 0;
    id = 1;
    line = 1;
    column = 1;
    space = false;
    constructor(input) {
        this.input = input;
    }
    peekToken() {
        const pointer = this.pointer;
        const id = this.id;
        const line = this.line;
        const column = this.column;
        const token = this.getNextToken();
        this.pointer = pointer;
        this.id = id;
        this.line = line;
        this.column = column;
        return token;
    }
    hasMoreTokens() {
        return !(this.peekToken() instanceof EOF_1.default);
    }
    getNextToken() {
        const char = this.peek();
        if (/[a-zA-Z]/.test(char))
            return this.getIdentifier();
        if (/[0-9]/.test(char))
            return this.getNumber();
        if (/\s/.test(char))
            return this.getSpace();
        const next = this.getNext();
        switch (char) {
            case "":
                return new EOF_1.default();
            case ",":
                return new Comma_1.default(next);
            case ":":
                return new Colon_1.default(next);
            case ";":
                return new SemiColon_1.default(next);
            case "(":
                return new OpenParenthesis_1.default(next);
            case ")":
                return new CloseParenthesis_1.default(next);
            case "!":
                return new ExclamationMark_1.default(next);
            case "<":
                return new LessThan_1.default(next);
            case ">":
                return new GreaterThan_1.default(next);
            case "+":
                return new Plus_1.default(next);
            case "-":
                return new Minus_1.default(next);
            case "*":
                return new Product_1.default(next);
            case "/":
                return new Slash_1.default(next);
            case "^":
                return new Power_1.default(next);
            case "\\":
                return new BackSlash_1.default(next);
            case '"':
                return new Quote_1.default(next);
            case "=":
                return new Equals_1.default(next);
            case "{":
                return new OpenBrace_1.default(next);
            case "}":
                return new CloseBrace_1.default(next);
            case ".":
                return new Dot_1.default(next);
            default:
                return new BadToken_1.default(next);
        }
    }
    getNumber() {
        let view = "";
        while (/[0-9]/.test(this.peek()))
            view += this.getNext();
        return new Number_1.default(view);
    }
    getSpace() {
        let view = "";
        while (/\s/.test(this.peek()))
            view += this.getNext();
        if (this.space)
            return new Space_1.default(view);
        return this.getNextToken();
    }
    getIdentifier() {
        let view = "";
        while (/[a-zA-Z]/.test(this.peek()))
            view += this.getNext();
        return new Identifier_1.default(view);
    }
    peek() {
        return this.input.charAt(this.pointer);
    }
    getNext() {
        const character = this.peek();
        if (character) {
            this.pointer = this.pointer + 1;
            if (character === "\n") {
                this.line = this.line + 1;
                this.column = 1;
            }
            else {
                this.column = this.column + 1;
            }
        }
        return character;
    }
    considerSpace() {
        this.space = true;
    }
    ignoreSpace() {
        this.space = false;
    }
}
exports.default = Lexer;
