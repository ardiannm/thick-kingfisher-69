import { LineSpan } from "../../lexing/line.span";
import { BoundExpression } from "./bound.expression";
import { BoundKind } from "./bound.kind";
import { BoundUnaryOperatorKind } from "./bound.kind";

export class BoundUnaryExpression extends BoundExpression {
  constructor(public operatorKind: BoundUnaryOperatorKind, public right: BoundExpression, public override span: LineSpan) {
    super(BoundKind.BoundUnaryExpression, span);
  }
}
