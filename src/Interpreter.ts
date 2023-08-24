import Parser from "./Parser";
import RuntimeValue from "./RuntimeValue";
import InterpreterError from "./InterpreterError";
import Binary from "./Binary";
import Program from "./Program";
import Unary from "./Unary";
import Token from "./Token";
import RuntimeNumber from "./RuntimeNumber";
import Substraction from "./Substraction";
import Multiplication from "./Multiplication";
import Division from "./Division";
import Number from "./Number";
import Exponentiation from "./Exponentiation";
import Negative from "./Negative";

export default class Interpreter extends Parser {
  public run() {
    return this.evaluate(this.parse());
  }

  evaluate<T extends Token>(token: T): RuntimeValue {
    if (token instanceof Program) return this.evaluateProgram(token);
    if (token instanceof Binary) return this.evaluateBinary(token);
    if (token instanceof Number) return this.evaluateNumber(token);
    if (token instanceof Unary) return this.evaluateUnary(token);
    return new InterpreterError(`Token type "${token.name}" has not been implemented for interpretation`);
  }

  private evaluateProgram(token: Program) {
    let value = new RuntimeValue();
    token.expressions.forEach((e) => (value = this.evaluate(e)));
    return value;
  }

  private evaluateNumber(token: Number) {
    return new RuntimeNumber(parseFloat(token.view));
  }

  private evaluateBinary(token: Binary) {
    const left = this.evaluate(token.left);
    const right = this.evaluate(token.right);

    if (!(left instanceof RuntimeNumber) || !(right instanceof RuntimeNumber)) {
      return new InterpreterError(`Can't perform binary operations between "${token.left.name}" and "${token.right.name}" tokens`);
    }

    switch (true) {
      case token instanceof Substraction:
        return new RuntimeNumber(left.value - right.value);
      case token instanceof Multiplication:
        return new RuntimeNumber(left.value * right.value);
      case token instanceof Division:
        return new RuntimeNumber(left.value / right.value);
      case token instanceof Exponentiation:
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
      case token instanceof Negative:
        return new RuntimeNumber(-right.value);
      default:
        return new RuntimeNumber(+right.value);
    }
  }
}
