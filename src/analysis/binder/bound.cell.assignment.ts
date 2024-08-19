import { Span } from "../text/span";
import { Cell } from "../../runtime/cell";
import { BoundExpression } from "./bound.expression";
import { BoundKind } from "./kind/bound.kind";

export class BoundCellAssignment extends BoundExpression {
  constructor(public reference: Cell, public override span: Span) {
    super(BoundKind.BoundCellAssignment, span);
  }
}
