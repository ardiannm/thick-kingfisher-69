import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";

export class BoundNumber extends BoundExpression {
  constructor(public Kind: BoundKind, public Value: number) {
    super(Kind);
  }
}
