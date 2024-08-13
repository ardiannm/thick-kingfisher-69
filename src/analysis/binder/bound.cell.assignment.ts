import { BoundCellReference } from "./bound.cell.reference";
import { BoundExpression } from "./bound.expression";
import { BoundKind } from "./kind/bound.kind";

export class BoundCellAssignment extends BoundExpression {
  constructor(public reference: BoundCellReference, public expression: BoundExpression) {
    super(BoundKind.BoundCellAssignment);
  }
}
