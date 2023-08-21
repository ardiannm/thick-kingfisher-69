import Expression from "./expression";
import Operator from "./operator";

export default class Unary extends Expression {
  constructor(public id: number, public operator: Operator, public right: Expression) {
    super(id);
  }
}
