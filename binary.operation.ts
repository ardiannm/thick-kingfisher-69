import { Expression } from "./expression.ts";
import { Operator } from "./operator.ts";

export class BinaryOperation extends Expression {
  constructor(public left: Expression, public operator: Operator, public right: Expression) {
    super();
  }
}
