"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const System_1 = __importDefault(require("./system/System"));
const SystemException_1 = __importDefault(require("./system/SystemException"));
const Binary_1 = __importDefault(require("./ast/expressions/Binary"));
const Program_1 = __importDefault(require("./ast/expressions/Program"));
const Unary_1 = __importDefault(require("./ast/expressions/Unary"));
const SystemNumber_1 = __importDefault(require("./system/SystemNumber"));
const SystemString_1 = __importDefault(require("./system/SystemString"));
const Substraction_1 = __importDefault(require("./ast/expressions/Substraction"));
const Multiplication_1 = __importDefault(require("./ast/expressions/Multiplication"));
const Division_1 = __importDefault(require("./ast/expressions/Division"));
const Number_1 = __importDefault(require("./ast/expressions/Number"));
const Exponentiation_1 = __importDefault(require("./ast/expressions/Exponentiation"));
const Negation_1 = __importDefault(require("./ast/expressions/Negation"));
const String_1 = __importDefault(require("./ast/expressions/String"));
const Interpolation_1 = __importDefault(require("./ast/expressions/Interpolation"));
const SpreadsheetCell_1 = __importDefault(require("./ast/spreadsheet/SpreadsheetCell"));
const ColumnToNumber_1 = __importDefault(require("./services/ColumnToNumber"));
const SpreadsheetRange_1 = __importDefault(require("./ast/spreadsheet/SpreadsheetRange"));
const SystemSpreadsheetCell_1 = __importDefault(require("./system/SystemSpreadsheetCell"));
const SystemSpreadsheetRange_1 = __importDefault(require("./system/SystemSpreadsheetRange"));
const HTMLTextContent_1 = __importDefault(require("./ast/html/HTMLTextContent"));
const HTMLElement_1 = __importDefault(require("./ast/html/HTMLElement"));
const HTMLScript_1 = __importDefault(require("./ast/html/HTMLScript"));
const HTMLComment_1 = __importDefault(require("./ast/html/HTMLComment"));
const Identifier_1 = __importDefault(require("./ast/expressions/Identifier"));
const SystemStringArray_1 = __importDefault(require("./system/SystemStringArray"));
const ImportStatement_1 = __importDefault(require("./ast/expressions/ImportStatement"));
const HTMLVoidElement_1 = __importDefault(require("./ast/html/HTMLVoidElement"));
class Interpreter {
    evaluate(token) {
        if (token instanceof ImportStatement_1.default)
            return this.evaluateImport(token);
        if (token instanceof Program_1.default)
            return this.evaluateProgram(token);
        if (token instanceof Identifier_1.default)
            return this.evaluateIdentifier(token);
        if (token instanceof Number_1.default)
            return this.evaluateNumber(token);
        if (token instanceof String_1.default)
            return this.evaluateString(token);
        if (token instanceof Interpolation_1.default)
            return this.evaluateInterpolation(token);
        if (token instanceof Unary_1.default)
            return this.evaluateUnary(token);
        if (token instanceof Binary_1.default)
            return this.evaluateBinary(token);
        if (token instanceof HTMLElement_1.default)
            return this.evaluateHTMLElement(token);
        if (token instanceof HTMLVoidElement_1.default)
            return this.evaluateVoidHTMLElement(token);
        if (token instanceof HTMLTextContent_1.default)
            return this.evaluateHTMLTextContent(token);
        if (token instanceof HTMLScript_1.default)
            return this.evaluateHTMLScript(token);
        if (token instanceof HTMLComment_1.default)
            return this.evaluateHTMLComment(token);
        if (token instanceof SpreadsheetCell_1.default)
            return this.evaluateSpreadsheetCell(token);
        if (token instanceof SpreadsheetRange_1.default)
            return this.evaluateSpreadsheetRange(token);
        throw new SystemException_1.default(`token type \`${token.type}\` has not been implemented for interpretation`);
    }
    evaluateImport(token) {
        return this.evaluate(token.program);
    }
    evaluateProgram(token) {
        let value = new System_1.default();
        token.expressions.forEach((e) => (value = this.evaluate(e)));
        return value;
    }
    evaluateNumber(token) {
        return new SystemNumber_1.default(parseFloat(token.view));
    }
    evaluateBinary(token) {
        const left = this.evaluate(token.left);
        const right = this.evaluate(token.right);
        if (!(left instanceof SystemNumber_1.default) || !(right instanceof SystemNumber_1.default)) {
            return new SystemException_1.default(`can't perform binary operations between \`${token.left.type}\` and "${token.right.type}" tokens`);
        }
        switch (true) {
            case token instanceof Substraction_1.default:
                return new SystemNumber_1.default(left.value - right.value);
            case token instanceof Multiplication_1.default:
                return new SystemNumber_1.default(left.value * right.value);
            case token instanceof Division_1.default:
                return new SystemNumber_1.default(left.value / right.value);
            case token instanceof Exponentiation_1.default:
                return new SystemNumber_1.default(left.value ** right.value);
            default:
                return new SystemNumber_1.default(left.value + right.value);
        }
    }
    evaluateUnary(token) {
        const right = this.evaluate(token.right);
        if (!(right instanceof SystemNumber_1.default)) {
            return new SystemException_1.default(`can't perform unary operation over "${token.right.type}" token`);
        }
        switch (true) {
            case token instanceof Negation_1.default:
                return new SystemNumber_1.default(-right.value);
            default:
                return new SystemNumber_1.default(+right.value);
        }
    }
    evaluateString(token) {
        return new SystemString_1.default(token.view);
    }
    evaluateInterpolation(token) {
        let view = "";
        token.strings.forEach((token) => {
            const runtime = this.evaluate(token);
            if (runtime instanceof SystemNumber_1.default) {
                view += runtime.value.toString();
            }
            else if (runtime instanceof SystemString_1.default) {
                view += runtime.value;
            }
        });
        return new SystemString_1.default(view);
    }
    evaluateSpreadsheetCell(token) {
        return new SystemSpreadsheetCell_1.default(parseFloat(token.row) || 0, (0, ColumnToNumber_1.default)(token.column));
    }
    evaluateSpreadsheetRange(token) {
        const left = this.evaluate(token.left);
        const right = this.evaluate(token.right);
        return new SystemSpreadsheetRange_1.default(left, right);
    }
    evaluateHTMLTextContent(token) {
        return new SystemString_1.default(token.view);
    }
    evaluateHTMLScript(token) {
        return new SystemString_1.default(token.view);
    }
    evaluateHTMLComment(token) {
        return new SystemString_1.default(token.view);
    }
    evaluateVoidHTMLElement(_) {
        return new SystemString_1.default("");
    }
    evaluateHTMLElement(token) {
        return new SystemStringArray_1.default(token.children.map((e) => this.evaluate(e)));
    }
    evaluateIdentifier(token) {
        return new SystemString_1.default(token.view);
    }
}
exports.default = Interpreter;
