"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Program_1 = __importDefault(require("./ast/expressions/Program"));
const Expression_1 = __importDefault(require("./ast/expressions/Expression"));
const Slash_1 = __importDefault(require("./ast/operators/Slash"));
const Power_1 = __importDefault(require("./ast/operators/Power"));
const Identifier_1 = __importDefault(require("./ast/expressions/Identifier"));
const GreaterThan_1 = __importDefault(require("./ast/tokens/GreaterThan"));
const SelfClosingHTMLElement_1 = __importDefault(require("./ast/html/SelfClosingHTMLElement"));
const LenientComponent_1 = __importDefault(require("./ast/html/LenientComponent"));
const Equals_1 = __importDefault(require("./ast/tokens/Equals"));
const Minus_1 = __importDefault(require("./ast/operators/Minus"));
const EOF_1 = __importDefault(require("./ast/tokens/EOF"));
const OpenTag_1 = __importDefault(require("./ast/html/OpenTag"));
const Attribute_1 = __importDefault(require("./ast/html/Attribute"));
const Plus_1 = __importDefault(require("./ast/operators/Plus"));
const Product_1 = __importDefault(require("./ast/operators/Product"));
const OpenParenthesis_1 = __importDefault(require("./ast/tokens/OpenParenthesis"));
const CloseParenthesis_1 = __importDefault(require("./ast/tokens/CloseParenthesis"));
const Quote_1 = __importDefault(require("./ast/tokens/Quote"));
const Substraction_1 = __importDefault(require("./ast/expressions/Substraction"));
const Identity_1 = __importDefault(require("./ast/expressions/Identity"));
const Negation_1 = __importDefault(require("./ast/expressions/Negation"));
const Division_1 = __importDefault(require("./ast/expressions/Division"));
const Addition_1 = __importDefault(require("./ast/expressions/Addition"));
const Multiplication_1 = __importDefault(require("./ast/expressions/Multiplication"));
const Exponentiation_1 = __importDefault(require("./ast/expressions/Exponentiation"));
const String_1 = __importDefault(require("./ast/expressions/String"));
const Parenthesis_1 = __importDefault(require("./ast/expressions/Parenthesis"));
const CloseTag_1 = __importDefault(require("./ast/html/CloseTag"));
const LessThan_1 = __importDefault(require("./ast/tokens/LessThan"));
const OpenScriptTag_1 = __importDefault(require("./ast/html/OpenScriptTag"));
const CloseScriptTag_1 = __importDefault(require("./ast/html/CloseScriptTag"));
const HTMLScript_1 = __importDefault(require("./ast/html/HTMLScript"));
const HTMLElement_1 = __importDefault(require("./ast/html/HTMLElement"));
const HTMLComponent_1 = __importDefault(require("./ast/html/HTMLComponent"));
const ParserService_1 = __importDefault(require("./services/ParserService"));
const ExclamationMark_1 = __importDefault(require("./ast/tokens/ExclamationMark"));
const HTMLComment_1 = __importDefault(require("./ast/html/HTMLComment"));
const HTMLTextContent_1 = __importDefault(require("./ast/html/HTMLTextContent"));
const Number_1 = __importDefault(require("./ast/expressions/Number"));
const Interpolation_1 = __importDefault(require("./ast/expressions/Interpolation"));
const OpenBrace_1 = __importDefault(require("./ast/tokens/OpenBrace"));
const CloseBrace_1 = __importDefault(require("./ast/tokens/CloseBrace"));
const SpreadsheetCell_1 = __importDefault(require("./ast/spreadsheet/SpreadsheetCell"));
const Colon_1 = __importDefault(require("./ast/tokens/Colon"));
const SpreadsheetRange_1 = __importDefault(require("./ast/spreadsheet/SpreadsheetRange"));
const BadToken_1 = __importDefault(require("./ast/tokens/BadToken"));
const Dot_1 = __importDefault(require("./ast/tokens/Dot"));
const SemiColon_1 = __importDefault(require("./ast/tokens/SemiColon"));
const Import_1 = __importDefault(require("./ast/expressions/Import"));
const ImportFile_1 = __importDefault(require("./services/ImportFile"));
const lenientTags = ["link", "br", "input", "img", "hr", "meta", "col", "textarea", "head"];
class Parser extends ParserService_1.default {
    parse() {
        return this.parseProgram();
    }
    parseProgram() {
        this.doNotExpect(this.peekToken(), EOF_1.default, "source file is empty");
        const expressions = new Array();
        while (this.hasMoreTokens()) {
            const expression = this.parseExpression();
            expressions.push(expression);
        }
        return new Program_1.default(expressions);
    }
    parseExpression() {
        if (this.peekToken().view === "using") {
            this.getNextToken();
            return this.parseImport();
        }
        if (this.peekToken().view === "DOCTYPE") {
            this.getNextToken();
            return this.parseHTMLComponent();
        }
        return this.parseTerm();
    }
    parseImport() {
        const errorMessage = "expecting a namespace identifier for module import";
        const token = this.expect(this.getNextToken(), Identifier_1.default, errorMessage);
        let nameSpace = token.view;
        while (this.peekToken() instanceof Dot_1.default) {
            this.getNextToken();
            nameSpace += "." + this.expect(this.getNextToken(), Identifier_1.default, errorMessage).view;
        }
        this.trackPosition();
        this.expect(this.getNextToken(), SemiColon_1.default, "semicolon `;` expected after an import statement");
        this.untrackPosition();
        const path = nameSpace.replace(/\./g, "/") + ".txt";
        let sourceCode = "";
        let namesSpaces = nameSpace.split(".");
        let lastNameSpace = namesSpaces[namesSpaces.length - 1];
        try {
            sourceCode = (0, ImportFile_1.default)(path);
        }
        catch (error) {
            this.throwError(`namespace \`${lastNameSpace}\` does not exist`);
        }
        try {
            this.trackPosition();
            const program = new Parser(sourceCode, path).parse();
            this.untrackPosition();
            return new Import_1.default(nameSpace, program);
        }
        catch (error) {
            console.log(error);
            this.throwError(`internal error found in \`${lastNameSpace}\` code base at \`./${path}\``);
        }
    }
    // this.throwError(`mismatching \`${right.tag}\` found for the \`${left.tag}\` tag`);
    // this.throwError(`expecting a closing \`${left.tag}\` tag`);
    parseHTMLComponent() {
        const left = this.parseHTMLTextContent();
        const from = this.pointer;
        const errorMessage = `expecting a closing \`${left.tag}\` tag`;
        if (left instanceof OpenTag_1.default) {
            const children = new Array();
            while (this.hasMoreTokens()) {
                const token = this.parseHTMLComponent();
                if (token instanceof HTMLComponent_1.default) {
                    children.push(token);
                    continue;
                }
                const right = this.expect(token, CloseTag_1.default, errorMessage);
                if (left.tag !== right.tag) {
                    if (lenientTags.includes(left.tag)) {
                        this.pointer = from;
                        return new LenientComponent_1.default(left.tag, left.attributes);
                    }
                    this.throwError(`\`${right.tag}\` is not a match for \`${left.tag}\` tag`);
                }
                return new HTMLElement_1.default(left.tag, left.attributes, children);
            }
            if (lenientTags.includes(left.tag))
                return left;
            this.throwError(errorMessage);
        }
        return left;
    }
    parseHTMLTextContent() {
        let view = "";
        this.considerSpace();
        if (this.peekToken() instanceof LessThan_1.default) {
            this.ignoreSpace();
            return this.parseHTMLScript();
        }
        while (this.hasMoreTokens()) {
            if (this.peekToken() instanceof LessThan_1.default)
                break;
            view += this.getNext();
        }
        this.ignoreSpace();
        if (/^\s+$/.test(view)) {
            return this.parseHTMLTextContent();
        }
        return new HTMLTextContent_1.default(view);
    }
    parseHTMLScript() {
        const left = this.parseTag();
        if (left instanceof OpenScriptTag_1.default) {
            let view = "";
            const right = this.parseHTMLTextContent();
            if (right instanceof HTMLTextContent_1.default) {
                view = right.view;
                this.trackPosition();
                const token = this.parseTag();
                this.expect(token, CloseScriptTag_1.default, `expecting \`CloseScriptTag\` but matched \`${token.type}\``);
                this.untrackPosition();
                return new HTMLScript_1.default(view);
            }
            this.expect(right, CloseScriptTag_1.default, `expecting \`CloseScriptTag\` but matched \`${right.type}\``);
            return new HTMLScript_1.default(view);
        }
        return left;
    }
    parseTag() {
        const left = this.parseHTMLComment();
        if (left instanceof HTMLComment_1.default)
            return left;
        if (this.peekToken() instanceof Slash_1.default) {
            this.getNextToken();
            const identifier = this.expect(this.parseTagIdentifier(), Identifier_1.default, "expecting identifier for closing tag");
            this.expect(this.getNextToken(), GreaterThan_1.default, "expecting `>` for closing tag");
            if (identifier.view === "script")
                return new CloseScriptTag_1.default();
            return new CloseTag_1.default(identifier.view);
        }
        const identifier = this.expect(this.parseTagIdentifier(), Identifier_1.default, "expecting identifier for open tag");
        const attributes = new Array();
        while (this.peekToken() instanceof Identifier_1.default) {
            attributes.push(this.parseAttribute());
        }
        if (this.peekToken() instanceof Slash_1.default) {
            const token = this.getNextToken();
            this.expect(this.getNextToken(), GreaterThan_1.default, `expecting closing token \`>\` but matched \`${token.view}\` after tag name identifier \`${identifier.view}\``);
            return new SelfClosingHTMLElement_1.default(identifier.view, attributes);
        }
        const token = this.getNextToken();
        this.expect(token, GreaterThan_1.default, `expecting a closing \`>\` for \`${identifier.view}\` open tag but matched \`${token.view}\` character`);
        if (identifier.view === "script")
            return new OpenScriptTag_1.default();
        return new OpenTag_1.default(identifier.view, attributes);
    }
    parseHTMLComment() {
        const left = this.expect(this.getNextToken(), LessThan_1.default, "expecting `<` for an html tag");
        if (this.peekToken() instanceof ExclamationMark_1.default) {
            this.trackPosition();
            this.expect(this.getNextToken(), ExclamationMark_1.default, "expecting `!` for a comment");
            const errorMessage = "expecting `--` after `!` for a comment";
            this.expect(this.getNextToken(), Minus_1.default, errorMessage);
            this.expect(this.getNextToken(), Minus_1.default, errorMessage);
            let view = "";
            while (this.hasMoreTokens()) {
                if (this.peekToken() instanceof Minus_1.default) {
                    const keep = this.pointer;
                    this.getNextToken();
                    const token = this.peekToken();
                    this.doNotExpect(token, GreaterThan_1.default, "expecting `--` before `>` for a comment");
                    if (token instanceof Minus_1.default) {
                        this.getNextToken();
                        this.expect(this.getNextToken(), GreaterThan_1.default, "expecting `>` for comment");
                        this.untrackPosition();
                        return new HTMLComment_1.default(view);
                    }
                    this.pointer = keep;
                }
                view += this.getNext();
            }
            this.throwError("unexpected end of comment");
        }
        return left;
    }
    parseTagIdentifier() {
        const identifier = this.expect(this.getNextToken(), Identifier_1.default, "expecting leading identifier for html tag name");
        let view = identifier.view;
        this.considerSpace();
        while (this.peekToken() instanceof Identifier_1.default || this.peekToken() instanceof Minus_1.default || this.peekToken() instanceof Number_1.default) {
            const token = this.getNextToken();
            if (token instanceof Minus_1.default && !(this.peekToken() instanceof Identifier_1.default) && !(this.peekToken() instanceof Number_1.default)) {
                this.throwError("expecting an ending number or identifier for the name tag");
            }
            view += token.view;
        }
        this.ignoreSpace();
        return new Identifier_1.default(view);
    }
    parseAttribute() {
        let property = "";
        if (this.peekToken() instanceof Identifier_1.default) {
            property += this.getNextToken().view;
        }
        this.considerSpace();
        while (this.peekToken() instanceof Identifier_1.default || this.peekToken() instanceof Minus_1.default || this.peekToken() instanceof Number_1.default || this.peekToken() instanceof Colon_1.default) {
            property += this.getNextToken().view;
        }
        this.ignoreSpace();
        let value = "";
        if (this.peekToken() instanceof Equals_1.default) {
            this.getNextToken();
            const token = this.peekToken();
            value = this.expect(this.parseString(), String_1.default, `expecting a string value after \`=\` following a tag property but matched \`${token.view}\``).view;
        }
        return new Attribute_1.default(property, value);
    }
    parseTerm() {
        const left = this.parseFactor();
        const token = this.peekToken();
        if (token instanceof Plus_1.default || token instanceof Minus_1.default) {
            this.expect(left, Expression_1.default, "invalid left hand side in binary expression");
            this.getNextToken();
            this.doNotExpect(this.peekToken(), EOF_1.default, "unexpected end of binary expression");
            this.trackPosition();
            const right = this.expect(this.parseTerm(), Expression_1.default, "invalid right hand side in binary expression");
            this.untrackPosition();
            if (token instanceof Plus_1.default)
                return new Addition_1.default(left, right);
            return new Substraction_1.default(left, right);
        }
        return left;
    }
    parseFactor() {
        const left = this.parseExponent();
        const token = this.peekToken();
        if (token instanceof Product_1.default || token instanceof Slash_1.default) {
            this.expect(left, Expression_1.default, "invalid left hand side in binary expression");
            this.getNextToken();
            this.doNotExpect(this.peekToken(), EOF_1.default, "unexpected end of binary expression");
            this.trackPosition();
            const right = this.expect(this.parseFactor(), Expression_1.default, "invalid right hand side in binary expression");
            this.untrackPosition();
            if (token instanceof Product_1.default)
                return new Multiplication_1.default(left, right);
            return new Division_1.default(left, right);
        }
        return left;
    }
    parseExponent() {
        let left = this.parseUnary();
        if (this.peekToken() instanceof Power_1.default) {
            this.getNextToken();
            this.expect(left, Expression_1.default, "invalid left hand side in binary expression");
            this.doNotExpect(this.peekToken(), EOF_1.default, "unexpected end of binary expression");
            const right = this.expect(this.parseExponent(), Expression_1.default, "invalid right hand side in binary expression");
            left = new Exponentiation_1.default(left, right);
        }
        return left;
    }
    parseUnary() {
        if (this.peekToken() instanceof Plus_1.default || this.peekToken() instanceof Minus_1.default) {
            const operator = this.getNextToken();
            this.doNotExpect(this.peekToken(), EOF_1.default, "unexpected end of unary expression");
            const right = this.expect(this.parseUnary(), Expression_1.default, "invalid expression in unary expression");
            if (operator instanceof Plus_1.default)
                return new Identity_1.default(right);
            return new Negation_1.default(right);
        }
        return this.parseParenthesis();
    }
    parseParenthesis() {
        if (this.peekToken() instanceof OpenParenthesis_1.default) {
            this.getNextToken();
            this.doNotExpect(this.peekToken(), CloseParenthesis_1.default, "parenthesis closed with no expression");
            const expression = this.expect(this.parseTerm(), Expression_1.default, "expecting expression after an open parenthesis");
            this.expect(this.getNextToken(), CloseParenthesis_1.default, "expecting to close this parenthesis");
            return new Parenthesis_1.default(expression);
        }
        return this.parseString();
    }
    parseString() {
        if (this.peekToken() instanceof Quote_1.default) {
            this.getNextToken();
            let view = "";
            this.considerSpace();
            const terms = new Array();
            while (this.hasMoreTokens()) {
                const token = this.peekToken();
                if (token instanceof Quote_1.default)
                    break;
                if (token instanceof OpenBrace_1.default) {
                    if (view) {
                        terms.push(new String_1.default(view));
                        view = "";
                    }
                    const interpolation = this.parseInterpolation();
                    terms.push(interpolation);
                    continue;
                }
                const character = this.getNextToken();
                view += character.view;
            }
            this.expect(this.getNextToken(), Quote_1.default, "expecting a closing quote for the string");
            this.ignoreSpace();
            if (view)
                terms.push(new String_1.default(view));
            if (terms.length > 1)
                return new Interpolation_1.default(terms);
            return new String_1.default(view);
        }
        return this.parseRange();
    }
    parseInterpolation() {
        this.ignoreSpace();
        this.expect(this.getNextToken(), OpenBrace_1.default, "expecting '{' for string interpolation");
        const expression = this.parseTerm();
        this.expect(this.getNextToken(), CloseBrace_1.default, "expecting '}' for string interpolation");
        this.considerSpace();
        return expression;
    }
    parseRange() {
        let left = this.parseCell();
        const parsableCell = left instanceof SpreadsheetCell_1.default || left instanceof Identifier_1.default || left instanceof Number_1.default;
        if (parsableCell) {
            this.considerSpace();
            if (this.peekToken() instanceof Colon_1.default) {
                this.getNextToken();
                if (!parsableCell) {
                    this.throwError(`invalid left hand side for range expression`);
                }
                if (left instanceof Number_1.default)
                    left = new SpreadsheetCell_1.default("", left.view);
                if (left instanceof Identifier_1.default)
                    left = new SpreadsheetCell_1.default(left.view, "");
                this.trackPosition();
                let right = this.parseCell();
                this.doNotExpect(right, EOF_1.default, "oops! missing the right hand side for range expression");
                if (!(right instanceof SpreadsheetCell_1.default || right instanceof Identifier_1.default || right instanceof Number_1.default)) {
                    this.throwError(`invalid right hand side for range expression`);
                }
                if (right instanceof Number_1.default)
                    right = new SpreadsheetCell_1.default("", right.view);
                if (right instanceof Identifier_1.default)
                    right = new SpreadsheetCell_1.default(right.view, "");
                this.untrackPosition();
                this.ignoreSpace();
                return new SpreadsheetRange_1.default(left, right);
            }
            this.ignoreSpace();
        }
        return left;
    }
    parseCell() {
        const left = this.parseToken();
        if (left instanceof Identifier_1.default) {
            this.considerSpace();
            if (this.peekToken() instanceof Number_1.default) {
                const right = this.parseToken();
                this.ignoreSpace();
                return new SpreadsheetCell_1.default(left.view, right.view);
            }
            this.ignoreSpace();
        }
        return left;
    }
    parseToken() {
        const token = this.getNextToken();
        if (token instanceof BadToken_1.default)
            this.throwError(`bad input character \`${token.view}\` found`);
        return token;
    }
}
exports.default = Parser;
