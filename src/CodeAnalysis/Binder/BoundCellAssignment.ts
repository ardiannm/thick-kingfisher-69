import { BoundKind } from "./BoundKind";
import { BoundNode } from "./BoundNode";
import { BoundStatement } from "./BoundStatement";

export class BoundCellAssignment extends BoundStatement {
  constructor(
    public override Kind: BoundKind.CellAssignment,
    public Name: string,
    public Expression: BoundNode,
    public Subjects: Set<string>
  ) {
    super(Kind);
  }
}
