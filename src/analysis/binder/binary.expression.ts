import { BoundExpression } from "./expression";
import { BoundKind } from "./kind/bound.kind";
import { BoundBinaryOperatorKind } from "./kind/binary.operator.kind";

export class BoundBinaryExpression extends BoundExpression {
  constructor(public override Kind: BoundKind.BinaryExpression, public Left: BoundExpression, public OperatorKind: BoundBinaryOperatorKind, public Right: BoundExpression) {
    super(Kind);
  }
}
