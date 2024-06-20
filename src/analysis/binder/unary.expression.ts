import { BoundKind } from "./kind/bound.kind";
import { BoundExpression } from "./expression";
import { BoundUnaryOperatorKind } from "./kind/unary.operator.kind";

export class BoundUnaryExpression extends BoundExpression {
  constructor(public operatorKind: BoundUnaryOperatorKind, public right: BoundExpression) {
    super(BoundKind.UnaryExpression);
  }
}
