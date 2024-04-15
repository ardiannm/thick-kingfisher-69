import { BoundExpression } from "./expression";
import { BoundKind } from "./kind/bound.kind";

export class BoundNumericLiteral extends BoundExpression {
  constructor(public override Kind: BoundKind.NumericLiteral, public Value: number) {
    super(Kind);
  }
}
