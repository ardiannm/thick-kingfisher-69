import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";
import { BoundOperatorKind } from "./BoundOperatorKind";

export class BoundBinaryExpression extends BoundExpression {
  constructor(public Kind: BoundKind, public Left: BoundExpression, public Operator: BoundOperatorKind, public Right: BoundExpression) {
    super(Kind);
  }
}
