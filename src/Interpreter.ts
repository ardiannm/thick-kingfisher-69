import RuntimeValue from "./runtime/RuntimeValue";
import InterpreterException from "./services/InterpreterException";
import Binary from "./ast/expressions/Binary";
import Program from "./ast/expressions/Program";
import Unary from "./ast/expressions/Unary";
import Token from "./ast/tokens/Token";
import RuntimeNumber from "./runtime/RuntimeNumber";
import Substraction from "./ast/expressions/Substraction";
import Multiplication from "./ast/expressions/Multiplication";
import Division from "./ast/expressions/Division";
import Number from "./ast/expressions/Number";
import Exponentiation from "./ast/expressions/Exponentiation";
import Negation from "./ast/expressions/Negation";

export default class Interpreter {
  evaluate<T extends Token>(token: T): RuntimeValue {
    if (token instanceof Program) return this.evaluateProgram(token);
    if (token instanceof Binary) return this.evaluateBinary(token);
    if (token instanceof Number) return this.evaluateNumber(token);
    if (token instanceof Unary) return this.evaluateUnary(token);
    return new InterpreterException(`token type \`${token.type}\` has not been implemented for interpretation`);
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
      return new InterpreterException(`can't perform binary operations between \`${token.left.type}\` and "${token.right.type}" tokens`);
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
      return new InterpreterException(`can't perform unary operation over "${token.right.type}" token`);
    }

    switch (true) {
      case token instanceof Negation:
        return new RuntimeNumber(-right.value);
      default:
        return new RuntimeNumber(+right.value);
    }
  }
}
