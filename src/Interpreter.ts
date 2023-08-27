import RuntimeValue from "./runtime/RuntimeValue";
import InterpreterError from "./utils/InterpreterError";
import Binary from "./tokens/expressions/Binary";
import Program from "./tokens/expressions/Program";
import Unary from "./tokens/expressions/Unary";
import Token from "./tokens/basic/Token";
import RuntimeNumber from "./runtime/RuntimeNumber";
import Substraction from "./tokens/expressions/Substraction";
import Multiplication from "./tokens/expressions/Multiplication";
import Division from "./tokens/expressions/Division";
import Number from "./tokens/expressions/Number";
import Exponentiation from "./tokens/expressions/Exponentiation";
import Negative from "./tokens/expressions/Negative";

export default class Interpreter {
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
