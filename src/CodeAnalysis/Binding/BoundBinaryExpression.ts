import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";
import { BoundBinaryOperatorKind } from "./BoundBinaryOperatorKind";

export class BoundBinaryExpression extends BoundExpression {
  constructor(public Kind: BoundKind, public Left: BoundExpression, public OperatorKind: BoundBinaryOperatorKind, public Right: BoundExpression) {
    super(Kind);
  }
}
