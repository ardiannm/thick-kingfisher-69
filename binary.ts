import Expression from "./expression.ts";
import Operator from "./operator.ts";

export default class Binary extends Expression {
  constructor(public id: number, public left: Expression, public operator: Operator, public right: Expression) {
    super(id);
  }
}
