import Binary from "./binary.ts";
import Division from "./division.ts";
import Minus from "./minus.ts";
import Multiplication from "./multiplication.ts";
import Number from "./number.ts";
import Parenthesis from "./parenthesis.ts";
import Parser from "./parser.ts";
import Power from "./power.ts";
import Program from "./program.ts";
import InterpreterError from "./interpreter.error.ts";
import RuntimeNumber from "./runtime.number.ts";
import RuntimeValue from "./runtime.value.ts";
import Token from "./token.ts";
import Unary from "./unary.ts";

export default class Interpreter extends Parser {
  //

  public run() {
    const tree = this.parse();
    if (this.errors.length) return this.errors;
    const runtime = this.evaluate(tree);
    return runtime;
  }

  evaluate<T extends Token>(token: T): RuntimeValue {
    if (token instanceof Program) return this.evaluateProgram(token);
    if (token instanceof Binary) return this.evaluateBinary(token);
    if (token instanceof Number) return this.evaluateNumber(token);
    if (token instanceof Unary) return this.evaluateUnary(token);
    if (token instanceof Parenthesis) return this.evaluateParenthesis(token);
    return new InterpreterError(`Token type "${token.constructor.name}" has not been implemented for interpretation.`);
  }

  private evaluateProgram(token: Program) {
    let value = new RuntimeValue();
    token.expressions.forEach((e) => (value = this.evaluate(e)));
    return value;
  }

  private evaluateNumber(token: Number) {
    return new RuntimeNumber(parseFloat(token.raw));
  }

  private evaluateBinary(token: Binary) {
    const left = this.evaluate(token.left);
    const right = this.evaluate(token.right);

    if (!(left instanceof RuntimeNumber) || !(right instanceof RuntimeNumber)) {
      return new InterpreterError(`Can't perform binary operations between "${token.left.constructor.name}" and "${token.right.constructor.name}" tokens.`);
    }

    switch (true) {
      case token.operator instanceof Minus:
        return new RuntimeNumber(left.value - right.value);
      case token.operator instanceof Multiplication:
        return new RuntimeNumber(left.value * right.value);
      case token.operator instanceof Division:
        return new RuntimeNumber(left.value / right.value);
      case token.operator instanceof Power:
        return new RuntimeNumber(left.value ** right.value);
      default:
        return new RuntimeNumber(left.value + right.value);
    }
  }

  private evaluateUnary(token: Unary) {
    const right = this.evaluate(token.right);

    if (!(right instanceof RuntimeNumber)) {
      return new InterpreterError(`Can't perform unary operation over "${token.right.constructor.name}" token`);
    }

    switch (true) {
      case token.operator instanceof Minus:
        return new RuntimeNumber(-right.value);
      default:
        return new RuntimeNumber(+right.value);
    }
  }

  private evaluateParenthesis(token: Parenthesis) {
    return this.evaluate(token.expression);
  }
}
