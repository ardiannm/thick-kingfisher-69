import Expression from "./expression.ts";
import Operator from "./operator.ts";

export default class Unary extends Expression {
  constructor(public operator: Operator, public right: Expression, public from: number, public to: number) {
    super(from, to);
  }
}
