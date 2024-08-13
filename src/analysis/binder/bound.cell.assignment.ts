import { Cell } from "../../runtime/cell";
import { Span } from "../text/span";
import { BoundExpression } from "./bound.expression";
import { BoundKind } from "./kind/bound.kind";

export class BoundCellAssignment extends BoundExpression {
  constructor(public reference: Cell, public expression: BoundExpression, public override span: Span) {
    super(BoundKind.BoundCellAssignment, span);
  }
}
