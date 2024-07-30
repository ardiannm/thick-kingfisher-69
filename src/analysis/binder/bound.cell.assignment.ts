import { BoundCell } from "./bound.cell";
import { BoundExpression } from "./bound.expression";
import { BoundKind } from "./kind/bound.kind";

export class BoundCellAssignment extends BoundExpression {
  constructor(public reference: BoundCell, public expression: BoundExpression) {
    super(BoundKind.BoundCellAssignment);
  }
}
