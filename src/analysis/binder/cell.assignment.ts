import { Cell } from "../../runtime/cell";
import { BoundExpression } from "./expression";
import { BoundKind } from "./kind/bound.kind";

export class BoundCellAssignment extends BoundExpression {
  constructor(public reference: Cell, public expression: BoundExpression) {
    super(BoundKind.CellAssignment);
  }
}
