import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";

export class BoundWithReference extends BoundExpression {
  constructor(public Kind: BoundKind, public Reference: string) {
    super(Kind);
  }
}
