import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";
import { BoundStatement } from "./BoundStatement";

export class BoundIsStatement extends BoundStatement {
  constructor(public Kind: BoundKind, public Definition: BoundExpression, public Assignee: BoundExpression) {
    super(Kind);
  }
}
