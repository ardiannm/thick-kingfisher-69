import { Span } from "../../lexing/span";
import { BoundExpression } from "./bound.expression";
import { BoundKind } from "./kind/bound.kind";
import { BoundUnaryOperatorKind } from "./kind/bound.unary.operator.kind";

export class BoundUnaryExpression extends BoundExpression {
  constructor(public operatorKind: BoundUnaryOperatorKind, public right: BoundExpression, public override span: Span) {
    super(BoundKind.BoundUnaryExpression, span);
  }
}
