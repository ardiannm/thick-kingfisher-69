import Expression from "./Expression";
import Operator from "./Operator";

export default class Binary extends Expression {
  constructor(public id: number, public left: Expression, public operator: Operator, public right: Expression) {
    super(id);
  }
}
