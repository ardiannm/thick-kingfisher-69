import { Cell } from "../../cell";
import { BoundExpression } from "./expression";
import { BoundKind } from "./kind/bound.kind";

export class BoundCellAssignment extends BoundExpression {
  constructor(public override kind: BoundKind.CellAssignment, public cell: Cell) {
    super(kind);
  }
}
