import Expression from "./Expression";
import Operator from "./Operator";

export default class Binary extends Expression {
  constructor(public gen: number, public left: Expression, public operator: Operator, public right: Expression) {
    super(gen);
  }
}
