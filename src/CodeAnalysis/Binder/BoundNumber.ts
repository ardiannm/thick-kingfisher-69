import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";

export class BoundNumber extends BoundExpression {
  constructor(public override Kind: BoundKind.NumericLiteral, public Value: number) {
    super(Kind);
  }
}
