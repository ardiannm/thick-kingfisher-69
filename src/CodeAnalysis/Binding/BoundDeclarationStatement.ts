import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";
import { BoundStatement } from "./BoundStatement";

export class BoundDeclarationStatement extends BoundStatement {
  constructor(public Kind: BoundKind, public Left: BoundExpression, public Expression: BoundExpression) {
    super(Kind);
  }
}
