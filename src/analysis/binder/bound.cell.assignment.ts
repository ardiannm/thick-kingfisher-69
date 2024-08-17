import { Span } from "../text/span";
import { BoundCell } from "./bound.cell";
import { BoundExpression } from "./bound.expression";
import { BoundKind } from "./kind/bound.kind";

export class BoundCellAssignment extends BoundExpression {
  constructor(public reference: BoundCell, public expression: BoundExpression, public override span: Span) {
    super(BoundKind.BoundCell, span);
  }
}
