import { Expression } from "./expression.ts";
import { Operator } from "./operator.ts";

export class Binary extends Expression {
  constructor(public left: Expression, public operator: Operator, public right: Expression) {
    super();
  }
}
