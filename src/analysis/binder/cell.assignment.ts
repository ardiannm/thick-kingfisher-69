import { Cell } from "../../cell";
import { BoundExpression } from "./expression";
import { BoundKind } from "./kind/bound.kind";

export class BoundCellAssignment extends BoundExpression {
  constructor(public override Kind: BoundKind.CellAssignment, public Cell: Cell) {
    super(Kind);
  }
}
