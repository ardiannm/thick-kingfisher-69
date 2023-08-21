"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = __importDefault(require("./parser"));
const runtime_value_1 = __importDefault(require("./runtime.value"));
const interpreter_error_1 = __importDefault(require("./interpreter.error"));
const binary_1 = __importDefault(require("./binary"));
const program_1 = __importDefault(require("./program"));
const unary_1 = __importDefault(require("./unary"));
const runtime_number_1 = __importDefault(require("./runtime.number"));
const substraction_1 = __importDefault(require("./substraction"));
const multiplication_1 = __importDefault(require("./multiplication"));
const division_1 = __importDefault(require("./division"));
const exponentiation_1 = __importDefault(require("./exponentiation"));
const number_1 = __importDefault(require("./number"));
class Interpreter extends parser_1.default {
    run() {
        return this.evaluate(this.parse());
    }
    evaluate(token) {
        if (token instanceof program_1.default)
            return this.evaluateProgram(token);
        if (token instanceof binary_1.default)
            return this.evaluateBinary(token);
        if (token instanceof number_1.default)
            return this.evaluateNumber(token);
        if (token instanceof unary_1.default)
            return this.evaluateUnary(token);
        return new interpreter_error_1.default(`Token type "${token.token}" has not been implemented for interpretation`);
    }
    evaluateProgram(token) {
        let value = new runtime_value_1.default();
        token.expressions.forEach((e) => (value = this.evaluate(e)));
        return value;
    }
    evaluateNumber(token) {
        return new runtime_number_1.default(parseFloat(token.view));
    }
    evaluateBinary(token) {
        const left = this.evaluate(token.left);
        const right = this.evaluate(token.right);
        if (!(left instanceof runtime_number_1.default) || !(right instanceof runtime_number_1.default)) {
            return new interpreter_error_1.default(`Can't perform binary operations between "${token.left.token}" and "${token.right.token}" tokens`);
        }
        switch (true) {
            case token.operator instanceof substraction_1.default:
                return new runtime_number_1.default(left.value - right.value);
            case token.operator instanceof multiplication_1.default:
                return new runtime_number_1.default(left.value * right.value);
            case token.operator instanceof division_1.default:
                return new runtime_number_1.default(left.value / right.value);
            case token.operator instanceof exponentiation_1.default:
                return new runtime_number_1.default(left.value ** right.value);
            default:
                return new runtime_number_1.default(left.value + right.value);
        }
    }
    evaluateUnary(token) {
        const right = this.evaluate(token.right);
        if (!(right instanceof runtime_number_1.default)) {
            return new interpreter_error_1.default(`Can't perform unary operation over "${token.right.constructor.name}" token`);
        }
        switch (true) {
            case token.operator instanceof substraction_1.default:
                return new runtime_number_1.default(-right.value);
            default:
                return new runtime_number_1.default(+right.value);
        }
    }
}
exports.default = Interpreter;
