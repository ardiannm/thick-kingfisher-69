import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./Kind/BoundKind";

export class BoundNumericLiteral extends BoundExpression {
  constructor(public override Kind: BoundKind.NumericLiteral, public Value: number) {
    super(Kind);
  }
}
