import { Span } from "../text/span";
import { BoundCellReference } from "./bound.cell.reference";
import { BoundExpression } from "./bound.expression";
import { BoundKind } from "./kind/bound.kind";

export class BoundCellAssignment extends BoundExpression {
  constructor(public reference: BoundCellReference, public expression: BoundExpression, public override span: Span) {
    super(BoundKind.BoundCellAssignment, span);
  }
}
