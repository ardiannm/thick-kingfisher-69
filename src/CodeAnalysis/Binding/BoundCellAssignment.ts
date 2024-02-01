import { Cell } from "../../Cell";
import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./Kind/BoundKind";

export class BoundCellAssignment extends BoundExpression {
  constructor(public override Kind: BoundKind.CellAssignment, public Cell: Cell) {
    super(Kind);
  }
}
