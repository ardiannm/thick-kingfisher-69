"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = __importDefault(require("./lexer"));
const program_1 = __importDefault(require("./program"));
const expression_1 = __importDefault(require("./expression"));
const newline_1 = __importDefault(require("./newline"));
const less_than_1 = __importDefault(require("./less.than"));
const division_1 = __importDefault(require("./division"));
const exponentiation_1 = __importDefault(require("./exponentiation"));
const identifier_1 = __importDefault(require("./identifier"));
const greater_than_1 = __importDefault(require("./greater.than"));
const uni_tag_1 = __importDefault(require("./uni.tag"));
const equals_1 = __importDefault(require("./equals"));
const substraction_1 = __importDefault(require("./substraction"));
const eof_1 = __importDefault(require("./eof"));
const open_tag_1 = __importDefault(require("./open.tag"));
const property_1 = __importDefault(require("./property"));
const addition_1 = __importDefault(require("./addition"));
const multiplication_1 = __importDefault(require("./multiplication"));
const open_parenthesis_1 = __importDefault(require("./open.parenthesis"));
const closing_parenthesis_1 = __importDefault(require("./closing.parenthesis"));
const quote_1 = __importDefault(require("./quote"));
const unknown_character_1 = __importDefault(require("./unknown.character"));
const warning_error_1 = __importDefault(require("./warning.error"));
const binary_1 = __importDefault(require("./binary"));
const unary_1 = __importDefault(require("./unary"));
const parser_error_1 = __importDefault(require("./parser.error"));
const string_1 = __importDefault(require("./string"));
const parenthesis_1 = __importDefault(require("./parenthesis"));
const closing_tag_1 = __importDefault(require("./closing.tag"));
const special_character_1 = __importDefault(require("./special.character"));
class Parser extends lexer_1.default {
    //
    parse() {
        return this.parseProgram();
    }
    parseProgram() {
        try {
            const data = this.keepState();
            this.doNotExpect(this.peekToken(), eof_1.default, "program cannot be empty");
            const expressions = new Array();
            while (this.hasMoreTokens()) {
                expressions.push(this.parseHTML());
                this.expect(this.getNextToken(), special_character_1.default, "expression must end with a ';'");
                if (this.hasMoreTokens()) {
                    this.expect(this.getNextToken(), newline_1.default, "new expression can only continue in a new line");
                }
            }
            const id = this.generate(data);
            return new program_1.default(id, expressions);
        }
        catch (report) {
            return report;
        }
    }
    parseHTML() {
        if (this.peekToken() instanceof less_than_1.default) {
            return this.parseTag();
        }
        return this.expect(this.parseMath(), expression_1.default, "math expression expected in the program");
    }
    parseTag() {
        const data = this.keepState();
        this.expect(this.getNextToken(), less_than_1.default, "expecting a open '<' token");
        const message = "expecting a closing '>' token for this tag";
        if (this.peekToken() instanceof division_1.default) {
            this.getNextToken();
            const identifier = this.expect(this.parseLiteral(), identifier_1.default, "expecting identifier for this closing tag");
            this.expect(this.getNextToken(), greater_than_1.default, message);
            const id = this.generate(data);
            return new closing_tag_1.default(id, identifier);
        }
        const identifier = this.expect(this.parseLiteral(), identifier_1.default, "expecting identifier for this open tag");
        const properties = this.parseProperties();
        if (this.peekToken() instanceof division_1.default) {
            this.getNextToken();
            this.expect(this.getNextToken(), greater_than_1.default, message);
            const id = this.generate(data);
            return new uni_tag_1.default(id, identifier, properties);
        }
        const id = this.generate(data);
        this.expect(this.getNextToken(), greater_than_1.default, message);
        return new open_tag_1.default(id, identifier, properties);
    }
    parseProperties() {
        const data = this.keepState();
        const props = new Array();
        while (this.peekToken() instanceof identifier_1.default) {
            const identifier = this.getNextToken();
            let view = "";
            if (this.peekToken() instanceof equals_1.default) {
                this.getNextToken();
                view = this.expect(this.parseString(), string_1.default, "expecting a string value after '=' token following a tag property").view;
            }
            const id = this.generate(data);
            props.push(new property_1.default(id, identifier, view));
        }
        return props;
    }
    parseMath() {
        return this.parseAddition();
    }
    parseAddition() {
        let left = this.parseMultiplication();
        while (this.peekToken() instanceof addition_1.default || this.peekToken() instanceof substraction_1.default) {
            const data = this.keepState();
            this.expect(left, expression_1.default, `invalid left hand side in ${this.peekToken().token} expression`);
            const operator = this.getNextToken();
            this.doNotExpect(this.peekToken(), eof_1.default, `unexpected ending of ${operator.token} expression`);
            const right = this.expect(this.parseMultiplication(), expression_1.default, `invalid right hand side in ${operator.token} expression`);
            const id = this.generate(data);
            left = new binary_1.default(id, left, operator, right);
        }
        return left;
    }
    parseMultiplication() {
        let left = this.parsePower();
        while (this.peekToken() instanceof multiplication_1.default || this.peekToken() instanceof division_1.default) {
            const data = this.keepState();
            const operator = this.getNextToken();
            this.expect(left, expression_1.default, `invalid left hand side in ${operator.token} expression`);
            this.doNotExpect(this.peekToken(), eof_1.default, `unexpected ending of ${operator.token} expression`);
            const right = this.expect(this.parsePower(), expression_1.default, `invalid right hand side in ${operator.token} expression`);
            const id = this.generate(data);
            left = new binary_1.default(id, left, operator, right);
        }
        return left;
    }
    parsePower() {
        let left = this.parseUnary();
        if (this.peekToken() instanceof exponentiation_1.default) {
            const data = this.keepState();
            const operator = this.getNextToken();
            this.expect(left, expression_1.default, `invalid left hand side in ${operator.token} expression`);
            this.doNotExpect(this.peekToken(), eof_1.default, `unexpected ending of ${operator.token} expression`);
            const right = this.expect(this.parsePower(), expression_1.default, `invalid right hand side in ${operator.token} expression`);
            const id = this.generate(data);
            left = new binary_1.default(id, left, operator, right);
        }
        return left;
    }
    parseUnary() {
        if (this.peekToken() instanceof addition_1.default || this.peekToken() instanceof substraction_1.default) {
            const data = this.keepState();
            const operator = this.getNextToken();
            this.doNotExpect(this.peekToken(), eof_1.default, `unexpected ending of ${operator.token} expression`);
            const right = this.expect(this.parseUnary(), expression_1.default, `invalid expression in ${operator.token} expression`);
            const id = this.generate(data);
            return new unary_1.default(id, operator, right);
        }
        return this.parseParanthesis();
    }
    parseParanthesis() {
        if (this.peekToken() instanceof open_parenthesis_1.default) {
            const data = this.keepState();
            this.getNextToken();
            this.doNotExpect(this.peekToken(), closing_parenthesis_1.default, "no expression provided within parenthesis statement");
            const expression = this.expect(this.parseAddition(), expression_1.default, "expecting expression after an open parenthesis");
            this.expect(this.getNextToken(), closing_parenthesis_1.default, "expecting to close this parenthesis");
            const id = this.generate(data);
            return new parenthesis_1.default(id, expression);
        }
        return this.parseString();
    }
    parseString() {
        if (this.peekToken() instanceof quote_1.default) {
            const data = this.keepState();
            this.getNextToken();
            let view = "";
            this.keepSpace();
            while (this.hasMoreTokens()) {
                if (this.peekToken() instanceof quote_1.default)
                    break;
                view += this.parseLiteral().view;
            }
            this.expect(this.getNextToken(), quote_1.default, "expecting a closing quote for the string");
            this.ignoreSpace();
            const id = this.generate(data);
            return new string_1.default(id, view);
        }
        return this.parseLiteral();
    }
    parseLiteral() {
        const token = this.getNextToken();
        if (token instanceof unknown_character_1.default) {
            this.report(new warning_error_1.default(`unknown character '${token.view}' found while parsing`, token));
        }
        return token;
    }
    assert(instance, constructor) {
        return instance instanceof constructor;
    }
    expect(token, tokenConstructor, message) {
        if (this.assert(token, tokenConstructor))
            return token;
        const error = new parser_error_1.default(message, token);
        this.report(error);
        throw error;
    }
    doNotExpect(token, tokenConstructor, message) {
        if (this.assert(token, tokenConstructor)) {
            const error = new parser_error_1.default(message, token);
            this.report(error);
            throw error;
        }
        return token;
    }
}
exports.default = Parser;
