import Expression from "./expression";
import Operator from "./operator";

export default class Binary extends Expression {
  constructor(public id: number, public left: Expression, public operator: Operator, public right: Expression) {
    super(id);
  }
}
