import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";

export class BoundHasReference extends BoundExpression {
  constructor(public Kind: BoundKind, public Reference: string) {
    super(Kind);
  }
}
