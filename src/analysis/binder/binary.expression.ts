import { BoundExpression } from "./bound.expression";
import { BoundKind } from "./kind/bound.kind";
import { BoundBinaryOperatorKind } from "./kind/bound.binary.operator.kind";
import { Span } from "../text/span";

export class BoundBinaryExpression extends BoundExpression {
  constructor(public left: BoundExpression, public operatorKind: BoundBinaryOperatorKind, public right: BoundExpression, public override span: Span) {
    super(BoundKind.BoundBinaryExpression, span);
  }
}
