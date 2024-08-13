import { BoundKind } from "./kind/bound.kind";
import { BoundExpression } from "./bound.expression";
import { BoundUnaryOperatorKind } from "./kind/bound.unary.operator.kind";
import { Span } from "../text/span";

export class BoundUnaryExpression extends BoundExpression {
  constructor(public operatorKind: BoundUnaryOperatorKind, public right: BoundExpression, public override span: Span) {
    super(BoundKind.BoundUnaryExpression, span);
  }
}
