import { TextSpan } from "../../lexing/text.span";
import { BoundExpression } from "./bound.expression";
import { BoundBinaryOperatorKind } from "./kind/bound.binary.operator.kind";
import { BoundKind } from "./kind/bound.kind";

export class BoundBinaryExpression extends BoundExpression {
  constructor(public left: BoundExpression, public operatorKind: BoundBinaryOperatorKind, public right: BoundExpression, public override span: TextSpan) {
    super(BoundKind.BoundBinaryExpression, span);
  }
}
