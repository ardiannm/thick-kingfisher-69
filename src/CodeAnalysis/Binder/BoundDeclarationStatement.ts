import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";
import { BoundStatement } from "./BoundStatement";

export class BoundDeclarationStatement extends BoundStatement {
  constructor(
    public Kind: BoundKind.ReferenceCell | BoundKind.CloneCell,
    public Name: string,
    public Expression: BoundExpression,
    public Dependencies: Set<string>
  ) {
    super(Kind);
  }
}
