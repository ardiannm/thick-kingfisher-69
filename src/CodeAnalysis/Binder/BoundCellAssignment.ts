import { Cell } from "../../Cell";
import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";

export class BoundCellAssignment extends BoundExpression {
  constructor(public override Kind: BoundKind.CellAssignment, public Reference: Cell) {
    super(Kind);
  }
}
