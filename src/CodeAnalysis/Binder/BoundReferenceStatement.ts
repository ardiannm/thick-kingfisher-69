import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";
import { BoundStatement } from "./BoundStatement";

export class BoundReferenceStatement extends BoundStatement {
  constructor(public Kind: BoundKind.ReferenceStatement, public Name: string, public Expression: BoundExpression, public Dependencies: Set<string>) {
    super(Kind);
  }
}
