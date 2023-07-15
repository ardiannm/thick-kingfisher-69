import { Token } from "./token.ts";
import { BinaryOperation } from "./binary.operation.ts";
import { Division } from "./division.ts";
import { Minus } from "./minus.ts";
import { Multiplication } from "./multiplication.ts";
import { Power } from "./power.ts";
import { RuntimeError } from "./runtime.error.ts";
import { RuntimeNumber } from "./runtime.number.ts";
import { RuntimeValue } from "./runtime.value.ts";
import { Number } from "./number.ts";

export class Interpreter {
  evaluate<T extends Token>(token: T): RuntimeValue {
    if (token instanceof BinaryOperation) return this.evaluateBinary(token);
    if (token instanceof Number) return this.evaluateNumber(token);
    return new RuntimeError(`Token type "${token.type}" has not been implemented for interpretation`);
  }

  private evaluateNumber(token: Number) {
    return new RuntimeNumber(parseFloat(token.literal));
  }

  private evaluateBinary(token: BinaryOperation) {
    const left = this.evaluate(token.left);
    const right = this.evaluate(token.right);

    if (!(left instanceof RuntimeNumber) || !(right instanceof RuntimeNumber)) {
      return new RuntimeError(`Can't perform math operations between "${token.left.type}" and "${token.right.type}" types`);
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
}
