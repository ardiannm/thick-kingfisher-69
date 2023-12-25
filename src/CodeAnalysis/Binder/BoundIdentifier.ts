import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";

export class BoundIdentifier extends BoundExpression {
  constructor(public override Kind: BoundKind.Identifier, public Name: string) {
    super(Kind);
  }
}
