import { TextSpan } from "../../lexing/text.span";
import { BoundExpression } from "./bound.expression";
import { BoundBinaryOperatorKind } from "./bound.kind";
import { BoundKind } from "./bound.kind";

export class BoundBinaryExpression extends BoundExpression {
  constructor(public left: BoundExpression, public operatorKind: BoundBinaryOperatorKind, public right: BoundExpression, public override span: TextSpan) {
    super(BoundKind.BoundBinaryExpression, span);
  }
}
