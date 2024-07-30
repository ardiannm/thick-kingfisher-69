import { BoundKind } from "./kind/bound.kind";
import { BoundExpression } from "./bound.expression";
import { BoundUnaryOperatorKind } from "./kind/bound.unary.operator.kind";

export class BoundUnaryExpression extends BoundExpression {
  constructor(public operatorKind: BoundUnaryOperatorKind, public right: BoundExpression) {
    super(BoundKind.BoundUnaryExpression);
  }
}
