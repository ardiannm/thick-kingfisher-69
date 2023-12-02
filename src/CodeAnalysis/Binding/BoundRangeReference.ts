import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";

export class BoundRangeReference extends BoundExpression {
  constructor(public Kind: BoundKind, public Reference: string) {
    super(Kind);
  }
}
