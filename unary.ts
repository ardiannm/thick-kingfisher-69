import Expression from "./expression.ts";
import Operator from "./operator.ts";

export default class Unary extends Expression {
  constructor(public operator: Operator, public right: Expression) {
    super();
  }
}
