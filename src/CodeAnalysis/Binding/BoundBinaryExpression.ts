import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./Kind/BoundKind";
import { BoundBinaryOperatorKind } from "./Kind/BoundBinaryOperatorKind";

export class BoundBinaryExpression extends BoundExpression {
  constructor(
    public override Kind: BoundKind.BinaryExpression,
    public Left: BoundExpression,
    public OperatorKind: BoundBinaryOperatorKind,
    public Right: BoundExpression
  ) {
    super(Kind);
  }
}
