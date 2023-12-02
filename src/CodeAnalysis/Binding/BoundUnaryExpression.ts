import { BoundKind } from "./BoundKind";
import { BoundExpression } from "./BoundExpression";
import { BoundUnaryOperatorKind } from "./BoundUnaryOperatorKind";

export class BoundUnaryExpression extends BoundExpression {
  constructor(public Kind: BoundKind, public Operator: BoundUnaryOperatorKind, public Expression: BoundExpression) {
    super(Kind);
  }
}
